// Обёртка для ajax-функций
var API = (function(self, FConfig) {
    'use strict';
	
	self.That = null;
	
    self.url = FConfig.baseUrl; // адрес сервера по умолчанию
	
	self.messagesCurrentDate = (new Date).getTime(); // дата выборки списка сообщений
	self.messagesCurrentList = ""; // текущий список сообщений, полученный в результате различных загрузок
	
    // режим отладки
    if (FConfig.debugMode) {
        self.url = FConfig.debugUrl;
    } // end if
	
    self._init = function() {
        if (FConfig.debugMode) {
            self.url = FConfig.debugUrl;
        } // end if
    };
	
    self.setThat = function(th) {
        self.That = th;
    };
	
    self.setUrl = function(url) {
        if (FConfig.debugMode) {
            self.url = FConfig.debugUrl;
        } else {
            self.url = url;
        } // end if
    }; // end fun
	
    self.getUrl = function() {
        return self.url;
    };
	
	self.mixinSID = function(url) {
		var sid = null;
		if(typeof Helpers.getCookie("sid") !== 'undefined') {
			sid = Helpers.getCookie("sid");
		} // end if
		return  url + '?_sid=' + sid;
	};
	
	self.mixinSIDPost = function(data) {
		var sid = null;
		if(typeof Helpers.getCookie("sid") !== 'undefined') {
			sid = Helpers.getCookie("sid");
		} // end if
		
		return  url + '&_sid=' + sid;
	};
	
	self.mixinSIDPostArr = function(data) {
		var sid = null;
		if(typeof Helpers.getCookie("sid") !== 'undefined') {
			sid = Helpers.getCookie("sid");
		} // end if
		
		if(typeof data['sid'] === 'undefined') {
			data['_sid'] = sid;
		} // end if
		
		return  data;
	};
	
	
	self.ajaxSetup = function() {
		$.ajaxSetup({
            headers: {
                Accept: "application/json",
            },
            cache: false,	
            beforeSend: function() {
                $("#loader").show();
            },
			complete: function() {
			    $("#loader").hide();
            }
        });
	},
	
    self.setup = function(newUrl) {
		if(typeof newUrl !== 'undefined') {
            self.setUrl(newUrl); // ставим начальный url
		} // end if
		
		var sid = Helpers.getCookie('sid');
		if(typeof sid === 'undefined') {
			sid = null;
		} // end if
		
        self.ajaxSetup();
    }; // end fun
    
    self.socketConnect =  function(callback, cb_msg) {
        
        var socket = io.connect('http://localhost:8080');

        
        socket.on('connect', function () {
            
            console.log('socket connect: localhost:8080');
            
            socket.on('message', function (msg) {

                cb_msg(msg);
            });
            
            callback(socket);
            
        });
        
    };
	
    self.messages = function(skip, lim, callback) {
		
		self.ajaxSetup();
		
        return $.ajax({
            type: "GET",
            dataType: "json",
            url: self.mixinSID(self.url + "/messages/" + skip + "/" + lim)
        }).done(function(data) {
            if (data.status == 'data') {
			    var revmessages = data.messages; // разворот массива, что бы последние сообщения были в конце
				
				self.messagesCurrentList = revmessages; // замещаем текущий список сообщений
                callback({"messages": revmessages, "histlink": data.histlink});  
            } else {
                Reactions.use("error", data);
            } // end if
        }).fail(function(e) {
			alert("Не удалось загрузить сообщения!");
			
			var errText = self.That.standartError(e.status, e.responseText);
            Reactions.use("error", {
                "error_text": errText
            });
        });
    }; // end fun
	
    self.messageSend = function(postString, text, callback) {
        
        if(self.That.isChrome) {
		
            return $.ajax({
                type: "POST",
                dataType: "json",
                url: self.mixinSID(self.url + "/add-message"),
                data: postString
            }).done(function(data) {
                if (data.status !== 'success') {
                    Reactions.use("errorContent", data);
                } else  {
                    callback();  // возврат последних сообщений и текущих
                }// end if
            }).fail(function(e) {
                var errText = self.That.standartError(e.status, e.responseText);
                Reactions.use("errorContent", {
                    "error_text": errText
                });
            });
        
        } else {
            
            console.log(JSON.stringify({"text":text, "sid": Helpers.getCookie("sid")}));
            
            self.That.socket.send(encodeURIComponent(JSON.stringify({"text":text, "sid": Helpers.getCookie("sid")})));
            callback();  // возврат последних сообщений и текущих
            
        } // end if
        
    
    }; // end fun
	
	// выборка младше указанной даты
	self.messagesNew = function(dt, callback) {
		
	    $.ajax({
		    type: "GET",
			dataType: "json",
			url: self.mixinSID(self.url + "/new-messages/" + dt + "/" + 30)
		}).done(function(data) {
			if (data.status == 'data') {
			   callback(data.messages);
			} else {
				Reactions.use("errorContent", data);
			} // end if
		}).fail(function(e) {
		     var errText = self.That.standartError(e.status, e.responseText);
			 Reactions.use("errorContent", {
			     "error_text": errText
			 });
		});
				
	}; // end fun
	
	// выборка старше указанной даты
	self.messagesFeed = function(dt, callback) {
		
	    $.ajax({
		    type: "GET",
			dataType: "json",
			url: self.mixinSID(self.url + "/feed-messages/" + dt+ "/" + 30)
		}).done(function(data) {
			if (data.status == 'data') {
				callback({"messages": data.messages, "histlink": data.histlink});
			} else {
				Reactions.use("errorContent", data);
			} // end if
		}).fail(function(e) {
		     var errText = self.That.standartError(e.status, e.responseText);
			 Reactions.use("errorContent", {
			     "error_text": errText
			 });
		});
				
	}; // end fun
	
    self.signup = function(form, callback) {
		
		self.ajaxSetup();
        
        return $.ajax({
            url: self.url + "/signup",
			data: new FormData(form.self),
			cache: false,
			contentType: false,
			processData: false,
			method: 'POST',
			type: 'POST' // For jQuery < 1.9
        }).done(function(data_str) {
            var data = JSON.parse(data_str);
            
            if (data.status === 'success') {
                callback(data);
            } else {
                Reactions.use("error", {
                   "error_text": data.error_text,
                   "error_code": data.error_code,
				   "time": 15000
                });
			} // end if
            
        }).fail(function(e) {
			var errText = self.That.standartError(e.status, e.responseText);
            Reactions.use("error", {
                "error_text": errText
            });
        });
        
		/*
        return $.ajax({
            type: "POST",
            dataType: "json",
            url: self.url + "/signup",
            data: postString
        }).done(function(data) {
            if (data.status === 'success') {
                callback(data);
            } else {
                Reactions.use("error", {
                   "error_text": data.error_text,
                   "error_code": data.error_code,
				   "time": 15000
                });
			} // end if
        }).fail(function(e) {
			var errText = self.That.standartError(e.status, e.responseText);
            Reactions.use("error", {
                "error_text": errText
            });
        });
        */
        
        
        
        
    }; // end fun
	
	
    self.settingsSave = function(postString, callback) {
		
        self.ajaxSetup();
		
        return $.ajax({
            type: "POST",
            dataType: "json",
            url: self.mixinSID(self.url + "/save-settings"),
            data: postString
        }).done(function(data) {
            if (data.status === 'success') {
                callback(data);
            } else {
                Reactions.use("error", {
                   "error_text": data.error_text,
                   "error_code": data.error_code,
				   "time": 15000
                });
			} // end if
        }).fail(function(e) {
			var errText = self.That.standartError(e.status, e.responseText);
            Reactions.use("error", {
                "error_text": errText
            });
        });
    }; // end fun
	
    self.login = function(postString, callback) {
		
        self.ajaxSetup();
		
        return $.ajax({
            type: "POST",
            dataType: "json",			
            url: self.url + "/login", 
            data: postString
        }).done(function(data) {
			
            if (data.status === 'success') {
				
				Helpers.setCookie("sid", data["_sid"], {"expires": 3600*24*30*12*100}); // примерно на 100 лет ставим Cookie (бессрочные)
                callback(data);
				
            } else {
                Reactions.use("error", data);
			} // end if
        }).fail(function(e) {
			var errText = self.That.standartError(e.status, e.responseText);
            Reactions.use("error", {
                "error_text": errText
            });
        });
    }; // end fun
	
    self.exit = function(callback) {
		
        self.ajaxSetup();
		
        return $.ajax({
            type: "GET",
            dataType: "json",			
            url: self.mixinSID(self.url + "/exit"), 
        }).done(function(data) {
			
            if (data.status === 'success') {
				
				Helpers.setCookie("sid", "", {"expires": ((new Date()).getTime() - 100)}); // примерно на 100 лет ставим Cookie (бессрочные)
                callback(data);
				
            } else {
                Reactions.use("error", data);
			} // end if
        }).fail(function(e) {
			var errText = self.That.standartError(e.status, e.responseText);
            Reactions.use("error", {
                "error_text": errText
            });
        });
    }; // end fun
	
	
    self._init();
    return self;
})(API || {}, FConfig);