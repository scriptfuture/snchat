var mongoose = require('mongoose');
var config = require('../config').config;

//============================================================================================
// Схемы таблиц
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  datetime:  { type: Number, index: true}, // создаём индекс для datetime
  login: { type: String, index: true}, // создаём индекс
  password:  String
});

mongoose.model("Users", UserSchema);
var Users = mongoose.model("Users");

var MessageSchema = new Schema({
  datetime:  { type: Number, index: true}, // создаём индекс для datetime
  text: String,
  login: { type: String, index: true}, // создаём индекс для кода пользователя
});

mongoose.model("Messages", MessageSchema);
var Messages = mongoose.model("Messages");
//============================================================================================
//============================================================================================
// Пользователи
exports.addUser = function(dt, login, password, callback){
    
    var newUser = new Users();
    newUser.datetime = dt;
    newUser.login = login;
    newUser.password = password;
    
    newUser.save(callback);
    
} 

exports.deleteUser = function(login, callback){
    
  // Удаляем элементы по  datetime
  Users.remove({'login': login}, callback);
   
} //  end fun

exports.updatePassword = function(login, pass, callback){
    
  // Редактируем пароль
  Users.update({'login': login}, {"password": pass} ,callback);
   
} //  end fun

exports.listUsers = function(skip_val,limit_val,callback){
	
      // Получаем все элементы коллекции с помощью find()
      Users.find().sort('-datetime').skip(skip_val).limit(limit_val).find({},callback);
   
} //  end fun

exports.allUsers = function(callback){
	
     // Получаем все элементы коллекции с помощью find()
     Users.find().sort('-datetime').find({},callback);
   
} //  end fun

exports.selectUsers = function(logins, callback){
	
     // Получаем все элементы коллекции с помощью find()
     Users.find({'login': { $in: logins }}, callback);
   
} //  end fun

exports.countUsers = function(callback){
	
      // Кол-во элементов
      Users.count(callback);
   
} //  end fun

var findUserByDT = exports.findUserByDT = function(dt, callback) {
	Users.findOne({'datetime': dt }, callback);
} // end

var findUserByLogin = exports.findUserByLogin = function(login, callback) {
	Users.findOne({'login': login }, callback);
} // end fun fun



//============================================================================================
//============================================================================================
// Сообщения
exports.addMessage = function(dt,  text, login, callback){
    
    var newMessage = new Messages();
    newMessage.datetime = dt;
    newMessage.text = text;
    newMessage.login = login;
    
    newMessage.save(callback);
    
} 

exports.deleteMessage = function(id, callback){
    
  // Удаляем элементы по  datetime
  Messages.remove({'_id': id}, callback);
   
} //  end fun

exports.listMessages = function(skip_val,limit_val,callback){
	
      // Получаем все элементы коллекции с помощью find()
      Messages.find().sort('-datetime').skip(skip_val).limit(limit_val).find({},callback);
   
} //  end fun

exports.newMessages = function(latest_date, limit_val, callback){

     Messages.find().limit(limit_val).find({"datetime": { "$gt" : latest_date }}, callback);

} //  end fun

exports.feedMessages = function(latest_date, limit_val, callback){

     Messages.find().limit(limit_val).sort('-datetime').find({"datetime": { "$lt" : latest_date }}, callback);

} //  end fun

exports.countMessages = function(callback){
	
      // Получаем все элементы коллекции с помощью find()
      Messages.count(callback);
   
} //  end fun

exports.allMessages = function(callback){
	
     // Получаем все элементы коллекции с помощью find()
     Messages.find().sort('-datetime').find({},callback);
   
} //  end fun

var findMessageById = exports.findMessageById = function(_id, callback) {
	Messages.findOne({'_id': _id }, callback);
} // end fun

//============================================================================================
//============================================================================================
// Соединение / установка
exports.connect = function(callback){
    mongoose.connect(config.mongoose_auth);
} // end fun

exports.disconnect = function(callback){
    mongoose.connect(callback);
} // end fun

exports.setup = function(callback){
    callback(null);	
}  // end fun

//============================================================================================




 