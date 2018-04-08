// Роутер - более общии наборы реактивов (запуск наборов реактивов)
var Router = (function(self, paramsReact) {
    'use strict';

    self.That = null;
    
    self.urls = {
        "@messages": "messages-pub",
        "messages": "messages",
        "exit": "exit",
        "signup": "signup",
        "login": "login",
        "settings": "settings"
        
       // "news\/([0-9]+)\/([0-9]+)": "news(num,id)"
    };

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self.setThat = function(th) {
        self.That = th;
    };
    
    // преобразуем хеш в вызов роута с параметрами
    self.hashToRoute = function() {
        
        var anc = window.location.hash.replace("#","");
        anc = anc.replace(/^\//,"");
        
        if (anc == "") anc = "@messages";
        
        var route_name = "page-not-found", route_arr = [];
        for(var i in self.urls){
            
            var re = new RegExp(i);
            if(re.test(anc)) {
                route_name = self.urls[i];
                route_arr = re.exec(anc);
                break;
            }
            
        } // end for
        
        if(/\(/g.test(route_name)) {
            
            var rs = route_name.split('(');
            var p = rs[1].replace(/\)$/gi, '');
            var p_arr = p.split(','); 
        
            var param = {"lang": self.That.lang};
            for(var i in route_arr) {
                if(i != 0) {
                    if(!!p_arr[i-1]) param[(p_arr[i-1] + "").trim()] = route_arr[i];
                }
                
            } // end for
            
            self.route(rs[0], param);
        
        } else {
            
           self.route(route_name, {"lang": self.That.lang}); 
        } // end if
 
    };
    
    self.init = function() {
        
        // преобразуем хеш в вызов роута с параметрами
        self.hashToRoute();
        
        window.addEventListener('popstate', function(e) {
            
            // преобразуем хеш в вызов роута с параметрами
            self.hashToRoute();
          
        });
        
    };

    // вызов роута (направления)
    self.route = function(state_src, params) {
		var state = state_src.replace(/-/g, '_');
		
		// удаляем метку интервала таймера для списка сообщений
		clearInterval(self.That.updateMessagesIntervalId);
		self.That.updateMessagesIntervalId = null;
		
		if(typeof self["_" + state] !== 'undefined') {
		    self["_" + state](params);
		} else {
		    // Если роут не обноружен, просто реднерим шаблон
            self.That.renderTemplate(state_src);
				
			//-------------------------------------
			// -- Обработчики по умалчанию --
			// Обработчики меню
             Reactions.use("menu", params);	
			 
			// Обработчики форм
            Reactions.use("forms", params);
			//-------------------------------------
		} // end if
		
        
    }; // end fun

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._messages_pub = function(params) {
		
		// последние 50 сообщений для всех посетителей
		API.messages(0, 50, function(data){
			
			var lastMessageDate = null;
			if(typeof data.messages[data.messages.length-1] !== 'undefined') {
				lastMessageDate = Helpers.formatDateNum(data.messages[data.messages.length-1].datetime);
			} // end if
			
			// -----  вызов обработчиков шаблонов
            self.That.renderTemplate("messages-pub", {
				"messages":  data.messages,
				"lastMessageDate": lastMessageDate,
				"histlink": data.histlink
            });
				
		    // обработчики меню
            Reactions.use("menu", params);	
				
		    // прокрутить скрол вниз
            Reactions.use("scrollBottom", data.messages);
			
			// каждые n секунд поиск на сервере новых сообщений
			Reactions.use("updateMessages", params);
		}); 

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._messages = function(params) {
        
        if(self.That.isAuthorized) {
		
            // последние 30 сообщений, если список сообщений открыт по ссылке
            API.messages(0, 30, function(data){
                
                // -----  вызов обработчиков шаблонов
                self.That.renderTemplate("messages", {
                    "messages":  data.messages,
                    "currentLogin":  Helpers.getCookie("login"),
                    "histlink": data.histlink
                });
                
                // обработчики меню
                Reactions.use("menu", params);
                    
                // обработчики форм
                Reactions.use("forms", params);
                    
                // прокрутить скрол вниз
                Reactions.use("scrollBottom", data.messages);
                
                // ссылка на чтение более ранних сообщений
                Reactions.use("historyMessages", params);
                
                // каждые n секунд поиск на сервере новых сообщений
                Reactions.use("updateMessages", params);
            }); 
        
        } else {
            
           // пользователь не авторизован
           self.That.renderTemplate("not-authorized");
                    
        } // end if

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._messages_send_update = function(params) {
        
        if(self.That.isAuthorized) {
		
            if(params.postData.text.trim() !=='') {

                // отправка сообщения
                API.messageSend(params.postString, function(messages){
                    
                    // отображения новых сообщений
                    self._messages_new(params);
                }); 
            
            } else {
                Reactions.use("errorContent", {
                    "error_code": 1010,
                    "error_text": "Field \"Text\"empty!"
                });
            } // end if
        
        } else {
            
              Reactions.use("error", {
                  "error_code": 1,
                  "error_text": "The session has expired!"
              });
                    
        } // end if

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._messages_history = function(params) {

		var lastDT = 0;
	    if(typeof API.messagesCurrentList[0] !== 'undefined') {
			lastDT = API.messagesCurrentList[0].datetime;
	    } // end if
		
		API.messagesFeed(lastDT, function(data){
			
			API.messagesCurrentList = data.messages.concat(API.messagesCurrentList);
			
			var resTpl = self.That.compileTemplate("update-messages", {
				"lang": params.lang,
				"messages": API.messagesCurrentList
			});
			$("div[data-messages]").html(resTpl);

			// скрываем ссылку "Ещё сообщений", если сообщений больше нет
			if(!data.histlink) {
                $("div[data-hist-link]").hide();	
			}  // end if

			// каждые n секунд поиск на сервере новых сообщений
			Reactions.use("updateMessages", params);			
			
		});

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._messages_new = function(params) {
        
        if(self.That.isAuthorized) {

            var firstDT = 0;
            if(typeof API.messagesCurrentList[API.messagesCurrentList.length-1] !== 'undefined') {
                firstDT = API.messagesCurrentList[API.messagesCurrentList.length-1].datetime;
            } // end if
        
            
            API.messagesNew(firstDT, function(messages){
                
                if(messages.length > 0) {
                
                    API.messagesCurrentList = API.messagesCurrentList.concat(messages);
                    
                    var resTpl = self.That.compileTemplate("update-messages", {"messages": API.messagesCurrentList});
                    $("div[data-messages]").html(resTpl);	
                    $("#messages-send-update textarea").val(""); // чистим поле с текстом
                    
                    // прокрутить скрол вниз
                    Reactions.use("scrollBottom", API.messagesCurrentList);
                    
                    // каждые n секунд поиск на сервере новых сообщений
                    Reactions.use("updateMessages", params);
                
                } // end if
                
             });
        
         } else {
            
              Reactions.use("error", {
                  "error_code": 1,
                  "error_text": "The session has expired!"
              });
                    
        } // end if


    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._login_send = function(params) {
		
		if(params.postData.login.trim() !=='' && params.postData.password.trim() !=='') {
		
			API.login(params.postString, function(){ 
			
			    // сохраняем логин при входе в Cookie
			    Helpers.setCookie("login", params.postData.login);
                
                // устанавливаем переменые авториации
                self.That.isAuthorized = true;
                self.That.currentLogin = params.postData.login;

				// после прохождения формы логина 
				// отображаем последние 30 сообщений
				self._messages(params);
			}); 
		
		} else {
			Reactions.use("error", {
                "error_code": 10,
                "error_text": "There are incomplete fields!",
				"time": 5000
            });
		} // end if

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._signup_send = function(params) {
		
		if(params.postData.login.trim() !=='' 
		   && params.postData.password.trim() !=='' 
		   && params.postData.repassword.trim() !=='' 
		   && params.postData.password === params.postData.repassword) {
		
			API.signup(params.postString, function(data){
				
				// сообщение об успешной регистрации
				 Reactions.use("info", {"text": self.That.getTranslation("registrationSuccessful", "text"), "time": 5000});
				 
				 Reactions.use("clearForm", {"formId": "signup-send"});
				
			}); 
		
		} else {
			
			if(params.postData.password.trim() !=='' && params.postData.password !== params.postData.repassword) {
				Reactions.use("error", {
					"error_code": 1004,
					"error_text": "Passwords do not match!",
					"time": 5000
				});	
			} else {
				Reactions.use("error", {
					"error_code": 10,
					"error_text": "There are incomplete fields!",
					"time": 5000
				});
			} // end if
		} // end if

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._settings = function(params) {
        
        if(self.That.isAuthorized) {
		
            // -----  вызов обработчиков шаблонов
            self.That.renderTemplate("settings");
                    
            // обработчики меню
            Reactions.use("menu", params);
                    
            // обработчики форм
            Reactions.use("forms", params);
        
        } else {
            
            
           // пользователь не авторизован
           self.That.renderTemplate("not-authorized");
                    
        } // end if

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._settings_send = function(params) {
        
        if(self.That.isAuthorized) {
		
            if(params.postData.password.trim() !=='' && params.postData.repassword.trim() !=='') {
            
                API.settingsSave(params.postString, function(data){
                     
                     // сообщение об успешном сохранении настроек
                     Reactions.use("info", {"text": self.That.getTranslation("settingsSuccess", "text"), "time": 5000});
                    
                }); 
            
            } else {
                Reactions.use("error", {
                    "error_code": 10,
                    "error_text": "There are incomplete fields!",
                    "time": 5000
                });
            } // end if
            
         } else {
            
              Reactions.use("error", {
                  "error_code": 1,
                  "error_text": "The session has expired!"
              });
                    
        } // end if
        
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._exit = function(params) {
		
		API.exit(function(data){
            
            // чистим переменые авториации
            self.That.isAuthorized = false;
            self.That.currentLogin = "";
			
			// отображаем публичную страницу с сообщениями
			self._messages_pub(params);
		}); 

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    return self;
})(Router || {}, {});