// загружаем модули для работы с mongodb
var mongoose = require('mongoose');

//--------------------------------------------------------
// Ядро системы
var config = require('./../config');
var phpf = require('./../core/php');       // Реализация php-функций
var access = require('./../core/access');  // MongoDB - сессии, управление правами
var db = require('./../core/dbmongoose');  // Обёртка для БД
var utils = require('./../core/utils');    // Дополнительные функции
//--------------------------------------------------------

exports.signup = function(req, res){ 

	var login = req.body.login;
	var password = req.body.password;
	
	if(typeof login !== 'undefined' && typeof password !== 'undefined' && login.trim() !== '' && password.trim() !== '') {
            
        var gtime=(new Date).getTime();
        
        db.findUserByLogin(login, function(err, doc){ 
		    if(err) throw err;
			
			if(doc === null) {
				
	            db.addUser(gtime, login, password,  function(error){
	                if(error) throw error;
			 
			        res.send(JSON.stringify({"status": "success"}));
	            }); 
				
			} else {
				
                res.send(JSON.stringify({"status": "error", "error_code": 20, "error_text": "User already exists!"}));
				
			} // end if

        });		  

   
   } else {
        res.send(JSON.stringify({"status": "error", "error_code": 10, "error_text": "There are incomplete fields!"}));
   	
   } // end if

}; // end fun

exports.login = function(req, res) {
    var login = req.body.login;
    var password = req.body.password;
	
    if(typeof login !== 'undefined' && typeof password !== 'undefined' && login.trim() !== '' && password.trim() !== '') {
		
        db.findUserByLogin(login, function(err, doc) {
            if(err) throw err;
			
            if(doc !== null) {
				
                if(doc.password == password) {
                    access.setSessionId(res, login, function(sid) {
                        res.send(JSON.stringify({
                            "status": "success",
							"_sid": sid
                        }));
                    });
                } else {
                    res.send(JSON.stringify({
                        "status": "error",
                        "error_code": 21,
                        "error_text": "Password is incorrect!"
                    }));
                } // end if
				
            } else {
                res.send(JSON.stringify({
                    "status": "error",
                    "error_code": 22,
                    "error_text": "Username is incorrect!"
                }));
            } // end if
        });
    } else {
        res.send(JSON.stringify({
            "status": "error",
            "error_code": 10,
            "error_text": "There are incomplete fields!"
        }));
    } // end if
}; // end fun

exports.exit = function(req, res){
	
     access.removeSession(req, function(error){
         if(error) throw error;
		 
	     res.send(JSON.stringify({"status": "success"}));
     });
}; // end fun

exports.cleanSessions = function(req, res){
    
     // удаляем сессию   
     req.session.destroy();
	
     access.cleanSessions(function(error){
         if(error) throw error;
		 
	     res.send(JSON.stringify({"status": "success"}));
     });
}; // end fun

exports.sessions = function(req, res){
	
    access.getSessions(function(error, data){
         if(error) throw error;
	     res.send(JSON.stringify({"status": "data",  sessions: data}));
    });
}; // end fun

exports.list = function(req, res) {
	
            // 30 последних сообщений
            db.listUsers(0, 30, function(error, data) {
                if(error) throw error;
                res.send(JSON.stringify({
                    "status": "data",
                    users: data
                }));
		
            });
}; // end fun

exports.all = function(req, res){
	
            db.allUsers(function(error, data){
                if(error) throw error;
			    res.send(JSON.stringify({"status": "data", users: data}));
           });

}; // end fun

exports.item = function(req, res){
	
	 var login = req.params.login;
	 
	 if(typeof login !== 'undefined') {
	
        db.findUserByLogin(login, function(err, doc) {
            if(err) throw err;
            
            res.send(JSON.stringify({"status": "data", user: doc}));    
        });
    
    } else {
        res.send(JSON.stringify({"status": "error", "error_code": 10, "error_text": "There are incomplete fields!"}));
    } // end if

}; // end fun

exports.remove = function(req, res){
	
	 var login = req.params.login;
	 
	 if(typeof login !== 'undefined') {
		
        db.findUserByLogin(login, function(err, doc){ 
		    if(err) throw err;

			if(doc !== null) {
				
                db.deleteUser(login, function(err, doc) {
                    if(err) throw err;
			 
			        res.send(JSON.stringify({"status": "success"}));
                });
				
			} else {
				
                res.send(JSON.stringify({"status": "error", "error_code": 23, "error_text": "User is not exists!"}));
				
			} // end if

        });		
    
    } else {
        res.send(JSON.stringify({"status": "error", "error_code": 10, "error_text": "There are incomplete fields!"}));
    } // end if

}; // end fun

exports.settings = function(req, res){
	
	 var form_login = req.login;
	 var form_password=req.body.password;
	
	 if(typeof form_password !== 'undefined' && form_password.trim() !== '') {
	
        db.updatePassword(form_login, form_password,  function(err, doc) {
            if(err) throw err;
            
			res.send(JSON.stringify({"status": "success"}));
        });
    
    } else {
        res.send(JSON.stringify({"status": "error", "error_code": 10, "error_text": "There are incomplete fields!"}));
    } // end if
	
	
}; // end fun
