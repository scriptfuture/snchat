var mongoose = require('mongoose');
var config = require('../config').config;

var utils = require('./utils'); // дополнительные функции

//============================================================================================
// Схемы таблиц
var Schema = mongoose.Schema;

var SessionsSchema = new Schema({
  createTime:  { type: Number, index: true}, // создаём индекс для datetime
  expirationTime:  { type: Number, index: true}, // создаём индекс для datetime
  login: { type: String, index: true}, // создаём индекс
  sid: { type: String, index: true}, // создаём индекс
});

mongoose.model("Sessions", SessionsSchema);
var Sessions = mongoose.model("Sessions");
//============================================================================================

// + сделать выход из системы 
// + и удаление всех открытых сессий, 
// - а так-же функцию проверку на доступ в каждом вызове (который этого требует)
// + в проверке на сессию добавить обновление даты истечения, после каждой проверки

exports.getSessions = function(callback) {
	
    // Получаем все элементы коллекции с помощью find()
    Sessions.find().sort('-createTime').find({}, callback);
	
}; // end fun

exports.removeSession = function(req, callback) {
	
	var CookieSID = utils.parseCookies(req)[config.sessionNameVar];
	
	// для CORS - подключений
	if(typeof CookieSID === 'undefined') { 
	    CookieSID = req.query["_sid"];
	} // end if
		
    if(typeof CookieSID !== 'undefined') {
		
        Sessions.findOne({
            'sid': CookieSID
        }, function(err, doc) {
            if(err) throw err;
			
			// если сессия существует
			if(doc !== null) {
				  Sessions.remove({'login': doc.login}, callback);
			} else {
				callback(null, 'Error log out!', 24);	
            } // end if			
        });
	} else {
	    callback(null, 'Error log out!', 24);	
	} // end if
}; // end fun

// удаление всех сессий
exports.cleanSessions = function(callback) {
	Sessions.remove(callback);
}; // end fun

var checkSessionId = exports.checkSessionId = function(req, callback) {
	
	var dtSec = new Date().getTime() * 1000;
	
    var CookieSID = utils.parseCookies(req)[config.sessionNameVar];
	
	// для CORS - подключений
	if(typeof CookieSID === 'undefined') { 
	    CookieSID = req.query["_sid"];
	} // end if
	
    if(typeof CookieSID !== 'undefined') {
		
        Sessions.findOne({
            'sid': CookieSID
        }, function(err, doc) {
            if(err) throw err;
			
			// если сессия существует
			if(doc !== null) {
				
				var dt = null;
			
			    if(doc.expirationTime * 1000 > dtSec) {
					
					dt = new Date().getTime();
					
					// асинхронное обновление даты истечения, после каждой проверки удачной сессии
					Sessions.update({'sid': CookieSID}, {"expirationTime": dt + (config.maxSessionTime * 1000)}, function() {
						//console.log('update expirationTime:' + (dt + (config.maxSessionTime * 1000)));
					});
					
					callback(doc);
			    
			    } else {
				
				    // асинхронно  удаляем сессию, не ожидая ответа бд
				    // удаление по логину, это обеспечивает выход из системы во всех браузерах и открытых окнах
				    Sessions.remove({'login': doc.login}, function() {
					  // console.log("Remove session login: "+ doc.login + " Ok!");
				    });
					
				    callback(null, 'The session has expired!', 1);	
				} // end id
					
			} else {
				callback(null, 'The session has expired!', 1);	
            } // end if			
        });
    } else {
		if(typeof callback !== 'undefined') {
            callback(null, "Access is denied!", 3); // если sid нет в Cookie, возвращаем ошибку
    	} // end if
    } // end if
	
}; // end fun

exports.check = function(req, res, callback) {
	
    checkSessionId(req, function(doc, err_text, err_code) {
        if(doc !== null) {
		   req.login = doc.login;
           callback(req, res);
        } else {
			if(typeof res !== 'undefined' && typeof res.send !== 'undefined') {
                res.send(JSON.stringify({
                    "status": "error",
                    "error_code": err_code,
                    "error_text": err_text
                }));
			} // end if
        } // end if
    });
	
}; // end fun

exports.checkAdmin = function(req, res, callback) {

    checkSessionId(req, function(doc, err_text, err_code) {
        if(doc !== null) {
			// сверка логинов
		    if(doc.login == config.SULogin) {	
				req.login = doc.login;
                callback(req, res);
		    } else {
                res.send(JSON.stringify({
                    "status": "error",
                    "error_code": 3,
                    "error_text": "Access is denied!"
                }));
			} // end if
        } else {
			if(typeof res !== 'undefined' && typeof res.send !== 'undefined') {
                res.send(JSON.stringify({
                    "status": "error",
                    "error_code": err_code,
                    "error_text": err_text
                }));
			} // end if
        } // end if
    });
}; // end fun

exports.setSessionId = function(res, login, callback) {
	
    var dt = new Date().getTime();
    var rWord = utils.randomWord(30);
	
    Sessions.findOne({
        'login': login
    }, function(err, doc) {
        if(err) throw err;
		
        if(doc === null) {
            var newSession = new Sessions();
            newSession.createTime = dt;
            newSession.expirationTime = dt + (config.maxSessionTime * 1000);
            newSession.login = login;
            newSession.sid = rWord;
            newSession.save(function() {
				
                res.cookie(config.sessionNameVar, rWord);
                callback(rWord);
            });
        } else {
			
			res.cookie(config.sessionNameVar, rWord);
			Sessions.update({'login': login}, {"createTime": dt, "expirationTime": dt + (config.maxSessionTime * 1000), "sid": rWord} , function() {
		        callback(rWord);
			});
        } // end if
		
    });
	
}; // end fun