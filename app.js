var express = require('express'), app = express();

// загружаем модули для работы с mongodb
var mongoose = require('mongoose');

var bodyParser = require('body-parser');

//--------------------------------------------------------
// Ядро системы
var config = require('./config');
var phpf = require('./core/php');       // Реализация php-функций
var access = require('./core/access');  // MongoDB - сессии, управление правами
var db = require('./core/dbmongoose');  // Обёртка для БД
var utils = require('./core/utils');    // Дополнительные функции
//--------------------------------------------------------
//--------------------------------------------------------
// Модули
var Users = require('./modules/users.js'); // модуль - Пользователи
var Messages = require('./modules/messages.js'); // модуль - Сообщения
//--------------------------------------------------------


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


db.connect(function(error){
    if(error) throw error;
});

// Path to our public directory
var pub = __dirname + '/public';

app.use("/", express.static(pub));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
	
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');

    // Pass to next layer of middleware
    next();
});

//---------------------------------------------------------------------------------------------------------------------------------
//----- Сообщения ----

// список с медленным skip
app.get('/messages/:skip/:lim', function(req, res) { 
	     Messages.list(req, res); 
 });
 
 // список старше последней даты сообщения
 app.get('/feed-messages/:dt/:lim', function(req, res) {
     Messages.feed(req, res);  //-> анонимный доступ
 });
 
// список младше последней даты сообщения
 app.get('/new-messages/:dt/:lim', function(req, res) {
     Messages.newList(req, res);  //-> анонимный доступ
 });
 
 // список со всеми сообщениями
app.get('/all-messages', function(req, res){
    // access.check(req, res, function(req, res) { 
	     Messages.all(req, res);
  //   }); 
 });
 
// добавить сообщение
app.post('/add-message', function(req, res){ 
     access.check(req, res, function(req, res) { 
	     Messages.add(req, res);
     }); 
});

// вернуть сообщение по id
app.get('/message/:id', function(req, res){
     access.checkAdmin(req, res, function(req, res) { 
	     Messages.item(req, res);  //-> доступ администратора
     }); 
});

// удалить сообщение
app.get('/remove-message/:id', function(req, res){     
// временно убираем
     //access.checkAdmin(req, res, function(req, res) { 
	     Messages.remove(req, res);  //-> доступ администратора
   //  }); 
});
//---------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------
//----- Пользователи ----

app.post('/signup', function(req, res){ 
    Users.signup(req, res);  //-> анонимный доступ
});

app.post('/login', function(req, res) {
    Users.login(req, res);  //-> анонимный доступ
});

app.get('/exit', function(req, res){
	Users.exit(req, res);
});


app.get('/clean-sessions', function(req, res){
     access.checkAdmin(req, res, function(req, res) { 
	     Users.cleanSessions(req, res);  //-> доступ администратора
     }); 
});

app.get('/sessions', function(req, res){
   // временно для отладки отключаем
  //   access.checkAdmin(req, res, function(req, res) { 
	     Users.sessions(req, res);  //-> доступ администратора
    // }); 
});


app.get('/users',function(req, res) {
     access.checkAdmin(req, res, function(req, res) { 
	     Users.list(req, res);  //-> доступ администратора
     }); 
});

app.get('/all-users', function(req, res){
	// временно для отладки отключаем
   //  access.checkAdmin(req, res, function(req, res) { 
	     Users.all(req, res);  //-> доступ администратора
   //  }); 
});

app.get('/user/:login', function(req, res){
     access.check(req, res, function(req, res) { 
	     Users.item(req, res);
     }); 
});

app.get('/remove-user/:login', function(req, res){
     access.checkAdmin(req, res, function(req, res) { 
	     Users.remove(req, res);  //-> доступ администратора
     }); 
});

app.post('/save-settings', function(req, res){
     access.check(req, res, function(req, res) { 
	     Users.settings(req, res);
     }); 	
});


//---------------------------------------------------------------------------------------------------------------------------------

app.listen(8000);
console.log('Listening on port 8000');
