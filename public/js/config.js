// файл конфигурации
var FConfig = (function(self, params) {
    'use strict';

    self._init = function() {};

    self.baseUrl = "http://"+document.location.host; // адрес по умолчанию

    self.defMethod = "POST"; // метод отправки данных по умалчанию

    self.debugMode = false; // режим отладки
    self.debugPort = 8000; // порт для тестирования виджета
    self.debugUrl = "http://localhost:"+self.debugPort; // адрес сервера для режима отладки

    // автовключение режима отладки
    var re = new RegExp("(localhost|127.0.0.1):" + self.debugPort, 'g');
    if (re.test(document.location.host)) {
        self.debugMode = true;
    } // end if

    // начальные данные если нет параметра 
    self.defStart = {
    };

    self._init();
    return self;
})(FConfig || {}, {});