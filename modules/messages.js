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

// список с медленным skip
exports.list = function(req, res) {

    var skip = parseInt(req.params.skip, 10);
    var lim = parseInt(req.params.lim, 10);

    if (typeof lim !== 'undefined' && typeof skip !== 'undefined') {

        if (lim >= config.max_lim && lim <= 0) {
            lim = config.def_lim;
        }
        if (skip >= config.max_skip && skip <= 0) {
            skip = config.def_skip;
        }

        // lim последних сообщений
        db.listMessages(skip, (lim + 1), function(error, m_arr) {
            if (error) throw error;
			
			var len = m_arr.length, histlink = false;
			
		    if(len > lim)  {
			    histlink = true; 
				m_arr.splice((len - 1), 1);
			} // end if

            res.send(JSON.stringify({
                "status": "data",
                messages: m_arr.reverse(),
				"histlink": histlink
            }));

        });
    } // end if
}; // end fun

exports.feed = function(req, res){
	
	 var dt = parseInt(req.params.dt, 10); // считать от даты
	 var lim = parseInt(req.params.lim, 10);
	 
	 if(typeof lim !== 'undefined' && typeof dt !== 'undefined') {
		 
		 if(lim >= config.max_lim && lim <= 0) { lim = config.def_lim; }
	 
	     // лента последних сообщений
         db.feedMessages(dt, (lim + 1), function(error, m_arr){
             if(error) throw error;
			 
			var len = m_arr.length, histlink = false;
			
		    if(len > lim)  {
			    histlink = true; 
				m_arr.splice((len - 1), 1);
			} // end if
			
			res.send(JSON.stringify({
			    "status": "data",  
				messages: m_arr.reverse(),
				"histlink": histlink
			}));

          });
	 } // end if

}; // end fun

exports.newList = function(req, res){
	
	 var dt = parseInt(req.params.dt, 10); // считать от даты
	 var lim = parseInt(req.params.lim, 10);
	 
	 if(typeof lim !== 'undefined' && typeof dt !== 'undefined') {
		 
		 if(lim >= config.max_lim && lim <= 0) { lim = config.def_lim; }
	 
	     // лента последних сообщений
         db.newMessages(dt, lim, function(error, m_arr){
             if(error) throw error;
			 res.send(JSON.stringify({"status": "data",  messages: m_arr}));

          });
	 } // end if

}; // end fun

exports.all = function(req, res){

    // все сообщения
    db.allMessages(function(error, m_arr){
         if(error) throw error;

		 var logins = [], resLogins = [], n = 0;
		 for(var i in m_arr) {
			 logins[m_arr[i].login] = null;
		 } // end if
		
		 for(var nm in logins) {
	         resLogins.push(nm); 
		 } // end if
		 
        db.selectUsers(resLogins, function(error, udata){
		    if(error) throw error;
		 
		 	res.send(JSON.stringify({"status": "data", "messages": m_arr, "users": udata}));
			
		});
     });

}; // end fun

exports.add = function(req, res){ 

	var form_text=req.body.text;
	var form_login = req.login;

	if(typeof form_text !== 'undefined' && typeof form_login !== 'undefined' && form_text.trim()!==''){	
            
        var gtime=(new Date).getTime();
        
        // чистим от тегов
        form_text = phpf.strip_tags(form_text);
		
	     db.addMessage(gtime, form_text, form_login,  function(error){
	         if(error) throw error;
			 
			 res.send(JSON.stringify({"status": "success"}));
           
	      });    

   
   } else {
        res.send(JSON.stringify({"status": "error", "error_code": 10, "error_text": "There are incomplete fields!"}));
   	
   } // end fun

}; // end fun

exports.item = function(req, res){
	
	 var id = req.params.id;
	 
	 if(typeof id !== 'undefined') {
	
        db.findMessageById(id, function(err, doc) {
            if(err) throw err;
            
            res.send(JSON.stringify({"status": "data", message: doc}));    
        });
    
    } else {
        res.send(JSON.stringify({"status": "error", "error_code": 10, "error_text": "There are incomplete fields!"}));
    } // end if

}; // end fun

exports.remove = function(req, res){
	
	 var id = req.params.id;
	 
	 var checkForHex = new RegExp("^[0-9a-fA-F]{24}$");
	 
	 if(typeof id !== 'undefined') {
		 
		if(checkForHex.test(id)) {
		
            db.findMessageById(id, function(err, doc){ 
		        if(err) throw err;

			    if(doc !== null) {
	
                    db.deleteMessage(id, function(err, doc) {
                        if(err) throw err;
			 
			            res.send(JSON.stringify({"status": "success"}));
                    });
		
			    } else {
			        res.send(JSON.stringify({"status": "error", "error_code": 30, "error_text": "Message is not exists!"}));	
	            } // end if
		
            });
		
		} else {
			
            res.send(JSON.stringify({"status": "error", "error_code": 11, "error_text": "Not valid ID!"}));	
		} // end if
    
    } else {
        res.send(JSON.stringify({"status": "error", "error_code": 10, "error_text": "There are incomplete fields!"}));
    } // end if

}; // end fun