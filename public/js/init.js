
(function() {
    'use strict';

    // Точка входа в виджет
    function Guestbook(moduleId, noIndex, moduleBaseUrl) {

            this.appId = 'body';  // добавляем все загрузки прямо в body
            this.$el = $(this.appId);
            this.context = {};
            this.currentTPL = ""; // текущий шаблон
			
			this.updateMessagesIntervalId = null; //  метка интервала таймера для списка сообщений
            
			
			this.templates = {};  // шаблоны
			this.lang = {};       // текущий языковой файл


            this.baseUrl = "";
            this.context.imgUrl = this.baseUrl  + "/img";
			
			// Инициализируем помошники
		    Helpers.init(this);
			
			// передаём контекст
			Router.setThat(this);
			Reactions.setThat(this);
			API.setThat(this);
			
			//  перв. установка ajax-запросов
            API.setup();

            // загрузка шаблонов
            var self = this;
            this.readyApp(function(data, err) {
			
			    var obj = data.templates;

			    // добавляем шаблоны в html-код виджета
		        for(var i in obj) {
			        $(self.appId).append(obj[i]);
		        } // end for
				
				// точка входа (главная страница)
		        Router.route("messages-pub", data);
            });

        } // end fun

    Guestbook.prototype = {

	    // загрузка шаблонов	(производится один раз)
        readyApp: function(callback) {
			
			var self = this;	

			$.ajax({
                 type: "GET",
                 dataType: "json",
                 url: self.baseUrl + "/locale/"+self.getLanguage()+".locale"
            }).done(function(lang) {
                 self.lang = lang;
				 
			htmlImport(self.baseUrl + '/', function(tpls){
				 callback({"templates":tpls, "lang": lang}, null);
			});
				 
                
            }).fail(function(e) {
                 callback(null, e);
           });
					
        },
		
        compileTemplate: function(tplName, data) {

            var template = Handlebars.compile($('#' + tplName).html());
            return Handlebars.compile(template(data));
        },

        renderTemplate: function(targetId, data) {

            if (typeof data === 'undefined') {
                data = {};
            } // end fun

            var tmpl = this.compileTemplate(targetId, data);

            $("#result").hide();
            $("#result").html(tmpl);

           // this.lesscssInit();

            $("#result").show();
			
			return tmpl;
        },

        getLanguage: function() {
            return 'ru_ru';
			// или en_us
        },

        // получаем перевод слова
        getTranslation: function(key, namespace) {
            return this.lang[namespace][key]; // неправильное получение данных о переводе
        },

        // получаем настройки
        getPrefs: function() {
            return this.prefs;
        },

        // стандартные ошибки
        standartError: function(code) {

            var self = this;

            code = parseInt(code, 10);

            var errorText = self.getTranslation("ConnectionError", "error");
            if (code === 404) {
                errorText = self.getTranslation("ErrorReadingData", "error");
            }
            if (code === 403) {
                errorText = self.getTranslation("403_Forbidden", "error");
            }
            if (code === 400) {
                errorText = self.getTranslation("400_BadRequest", "error");
            }
            if (code === 500) {
                errorText = self.getTranslation("500_InternalServerError", "error");
            }
            if (code === 503) {
                errorText = self.getTranslation("503_ServiceUnavailable", "error");
            }

            return errorText;
        }
    }; // end prototype

    new Guestbook();

})();