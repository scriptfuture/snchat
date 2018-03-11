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
    self._info = function(params) {
		
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
		
		// Космический html-хак, но по другому скрол не работает
	    var hChar = 20; // высота сивола + отступ снизу
	    var qChar = 35; // количество символов в строке
		
		// расчёт высоты блока  с сообщениями (примерный)
		var stCounter = 1, chCounter = 0, boxHeight = 0, mText = "", rn = 0;
		for(var i in messages) {
			if(messages[i].text !== '') {
				mText = messages[i].login + " " + messages[i].text;
			    for(var n in mText) {
					if(/\n|\r|\n\r/.test(mText[n])) { chCounter = qChar; }
				    if(chCounter >= qChar) { chCounter = 0; stCounter++;  } else { chCounter++; }
			    } // end for
			} // end if
			
			boxHeight += stCounter * hChar;
			
			chCounter = 0;
			stCounter = 1;
		} // end for
		
	    var elm = $("div[data-scroll]");
	
	    elm.css('overflow','hidden');
	    elm.animate({ scrollTop: boxHeight+ "px" }, 1, function() {
			
            // Animation complete.
	        elm.css('overflow','scroll');
		    elm.css('overflow-x','hidden');
        });


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
		
		// удаляем старую метку интервала таймера для списка сообщений
		// здесь так-же необходим этот код, так как происходит ручной рендеринг
		// в роуте messages_new
		clearInterval(self.That.updateMessagesIntervalId);
		self.That.updateMessagesIntervalId = null;
		
		// бесконечный цикл проверки новый сообщений на сервере
		self.That.updateMessagesIntervalId = setInterval(function(){ 
			counter++;

			// загружаем новые сообщения
			// не используем use(), что бы не удалить IntervalId
			Router._messages_new(params);
		}, 5000);
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    self._init();
    return self;
})(Reactions || {}, {});