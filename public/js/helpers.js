// Помошники
var Helpers = (function(self, FConfig) {
    'use strict';
	self.That = null;
	
    self.init = function(that) {
		
		self.That = that; // сохраняем текущий контекст

        // --- регистрация помошников шаблонизатора ---
        // переносы строк
        Handlebars.registerHelper('breaklines', function(text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
            return new Handlebars.SafeString(text);
        });

        // формат даты и времени
        Handlebars.registerHelper('formatdate', function(text) {
            return self.formatDate(text);
        });
		
        // короткий формат даты и времени
        Handlebars.registerHelper('formatdatelite', function(text) {
            return self.formatDateLite(text);
        });
        
        Handlebars.registerHelper('ifTrue', function(c, options) {
          if(c) {
            return options.fn(this);
          }
          return options.inverse(this);
        });
        
        Handlebars.registerHelper('ifCond', function(v1, v2, options) {
          if(v1 === v2) {
            return options.fn(this);
          }
          return options.inverse(this);
        });
        
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Подготовка данных перед выводом
    // пример: messages = self.prep(messages, { "datetime": function(dt) { return self.formatDate(dt); }});  // изменяем формат даты
    self.prep = function(data, modifModel) {
        for (var i in data) {
            for (var j in data[i]) {
                for (var n in modifModel) {
                    if (j === n) {
                        data[i][j] = modifModel[n](data[i][j]);
                    }
                } // end for
            } // end for
        } // end for
        return data;
    }; // end if
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self.formatDate = function(dt) {
		
		if(self.That.getLanguage() === 'ru_ru') {
		
			var today = new Date(dt);
			var day_of_week = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
			var month_of_year = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
			var day_ = day_of_week[today.getDay()];
			var date_ = today.getDate();
			var month_ = month_of_year[today.getMonth()];
			var year_ = today.getFullYear();
			var hours_ = today.getHours();
			var min_ = today.getMinutes();
			var sec_ = today.getSeconds();
			var zerom = '',
				zeros = '';
			if (min_ < 10) zerom = '0';
			if (sec_ < 10) zeros = '0';
			return day_ + ' ' + date_ + ' ' + month_ + ' ' + year_ + ' г. ' + hours_ + ':' + zerom + min_ + ':' + zeros + sec_;
		
		} else {
			return self.formatDateNum(dt);
		} // end if
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self.formatDateLite = function(dt) {
		
		if(self.That.getLanguage() === 'ru_ru') {
		
			var today = new Date(dt);
			var month_of_year = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
			var date_ = today.getDate();
			var month_ = month_of_year[today.getMonth()];
			var year_ = today.getFullYear();
			var hours_ = today.getHours();
			var min_ = today.getMinutes();
			var sec_ = today.getSeconds();
			var zerom = '';
			if (min_ < 10) zerom = '0';
			return date_ + ' ' + month_ + ' ' + year_ + ' г. ' + hours_ + ':' + zerom + min_ ;
		
		} else {
			return self.formatDateNum(dt);
		} // end if
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    self.formatDateNum = function(dt) {
        var today = new Date(dt);
        var date_ = today.getDate();
        var month_ = today.getMonth();
        var year_ = today.getFullYear();
        var hours_ = today.getHours();
        var min_ = today.getMinutes();
        var sec_ = today.getSeconds();
        var zerom = '',
            zeros = '',
			zerodt = '',
			zeromn = '';
			
        if (date_ < 10) zerodt = '0';
        if (month_ < 10) zeromn = '0';
			
        if (min_ < 10) zerom = '0';
        if (sec_ < 10) zeros = '0';
		if(self.That.getLanguage() === 'ru_ru') {
            return zerodt + date_ + '.' + zeromn + month_ + '.' + year_ + ' ' + hours_ + ':' + zerom + min_ + ':' + zeros + sec_;
		} else {
            return  zeromn + month_ + '-' + zerodt + date_ + '-' + year_ + ' ' + hours_ + ':' + zerom + min_ + ':' + zeros + sec_;
		} // end if
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Возвращает cookie с именем name, если есть, если нет, то undefined
    self.getCookie = function(name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    /* ---
    Устанавливает cookie с именем name.
	
    Аргументы:
    name - название cookie
    value - значение cookie (строка)
    options - Объект с дополнительными свойствами для установки cookie:
    expires - Время истечения cookie. Интерпретируется по-разному, в зависимости от типа:
            Число — количество секунд до истечения. Например, expires: 3600 — кука на час.
            Объект типа Date — дата истечения.
            Если expires в прошлом, то cookie будет удалено.
            Если expires отсутствует или 0, то cookie будет установлено как сессионное и исчезнет при закрытии браузера.
    path - Путь для cookie.
    domain - Домен для cookie.
    secure - Если true, то пересылать cookie только по защищенному соединению.
	--- */
    self.setCookie = function(name, value, options) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Удаляет cookie
	self.deleteCookie = function(name) {
	    self.setCookie(name, null, { expires: -1 })
	}; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Преобразует объект в массив переменных path/value
	// path - технический параметр, указывать не нужно
	self.objToArray = function(obj, path){
        if(!path) path = [];
        var result = [];

        for(var i in obj)
            if(typeof obj[i] == 'object')
                result = result.concat(self.objToArray(obj[i], [].concat(path, [i])));
            else
                result.push({path: [].concat(path, [i]), value: obj[i]});

        return result;
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Преобразует массив переменных path/value в url
    self.arrayToURL =  function(array){
        var vars = [];
        array.forEach(function(item, i){
            var parts = [];
            item.path.forEach(function(part, i){
                parts.push(i == 0 ? part : ('[' + part + ']'));
            });

            vars.push([parts.join(''), item.value].join('='));
        });

        return vars.join('&');
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Преобразует объект в url
	self.objectToURL =  function(obj){
        return self.arrayToURL(self.objToArray(obj));
    }; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Преобразует url в объект
	self.URLToObject = function(p) {
		var params = {};
		var pairs = p.split('&');
		for (var i=0; i<pairs.length; i++) {
			var pair = pairs[i].split('=');
			var accessors = [];
			var name = decodeURIComponent(pair[0]), value = decodeURIComponent(pair[1]);

			var name = name.replace(/\[([^\]]*)\]/g, function(k, acc) { accessors.push(acc); return ""; });
			accessors.unshift(name);
			var o = params;

			for (var j=0; j<accessors.length-1; j++) {
				var acc = accessors[j];
				var nextAcc = accessors[j+1];
				if (!o[acc]) {
					if ((nextAcc == "") || (/^[0-9]+$/.test(nextAcc)))
						o[acc] = [];
					else
						o[acc] = {};
				}
				o = o[acc];
			}
			acc = accessors[accessors.length-1];
			if (acc == "")
				o.push(value);
			else
				o[acc] = value;
		}
		return params;
	}; // end fun
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	
    return self;
})(Helpers || {}, FConfig);