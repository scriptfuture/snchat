// Реактивы - наборы состояний стилей и контента
var Reactions = (function(self, paramsReact) {
    'use strict';

    self.That = null;

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._init = function() {};

    self.setThat = function(th) {
        self.That = th;
    };

    // использовать реактив
    self.use = function(state, params) {
        self["_" + state](params);
    }; // end fun

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._info = function(params, callback) {
		
	    var obj = $("div[data-form-info]");
		obj.html(params.text);
		obj.show("slow");
		
		if(typeof params.time !== 'undefined') {
		    setTimeout(function() {
		        obj.hide("slow");
			}, params.time);
		} // end if

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._error = function(params) {

	    var obj = $("div[data-form-error]");
		
		var err = self.That.getTranslation('err'+params.error_code, 'error');
		
		if(typeof err === 'undefined') {
			obj.html(params.error_text);
		} else {
			obj.html(err);
		} // end if
		
		obj.show("slow");
		
		if(typeof params.time !== 'undefined') {
		    setTimeout(function() {
		        obj.hide("slow");
			}, params.time);
		} // end if

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._errorContent = function(params) {

	    var obj = $("div[data-error]");

		var err = self.That.getTranslation('err'+params.error_code, 'error');
		
		if(typeof err === 'undefined') {
			obj.html(params.error_text);
		} else {
			obj.html(err);
		} // end if
		
		obj.show();

		
		$("div[data-scroll]").css("height", 300);
		setTimeout(function() {
		    obj.hide("slow", function() {
                $("div[data-scroll]").css("height", 340);
            });
			
	    }, 3000);

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._menu = function(params) {

	    $("[data-link]").unbind('click'); // удаляем остальные события по клику
	    $("[data-link]").on('click', function(){
		    var lnk = $(this).data("link");
						
			Router.route(lnk, params);
            return false;
	    });

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._forms = function(params) {

	    $("[data-form]").unbind('click'); // удаляем остальные события по клику
	    $("[data-form]").on('click', function(){
		    var lnk = $(this).data("form");
			
			if($("#"+lnk)) {
			   // строка данных формы
			   params.postString = $("#"+lnk).serialize();
			   
			   // строку данных в объект
			   params.postData = Helpers.URLToObject(params.postString);
			} // end if
						
			Router.route(lnk, params);
            return false;
	    });

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// прокрутка вниз
    self._scrollBottom = function(messages) {

	    var elm = $("div[data-scroll]").get(0);		
		elm.scrollTop=elm.scrollHeight;

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._clearForm= function(params) {

	    $('#' + params.formId).children().children("input[type=text], input[type=password], textarea").each(function(){
		    $(this).val("");
		});

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._historyMessages= function(params) {

	   $("div[data-hist-link]").on('click', function(){

			// загружаем более ранние сообщения
			Router.route("messages_history", params);
			return false;
		});

    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self._updateMessages= function(params) {
		
		var counter = 0;
		
        if(self.That.isChrome) {

            clearInterval(self.That.updateMessagesIntervalId);
            self.That.updateMessagesIntervalId = null;
            
            // бесконечный цикл проверки новый сообщений на сервере
            self.That.updateMessagesIntervalId = setInterval(function(){ 
                counter++;

                // загружаем новые сообщения
                // не используем use(), что бы не удалить IntervalId
                Router._messages_new(params);
            }, 5000);
        
        } else {
            
            
        } // end if
        
       
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    self._init();
    return self;
})(Reactions || {}, {});