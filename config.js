// Конфигурация
exports.config = {
    mongoose_auth: 'mongodb://localhost:27017/guestbook',
    def_lim: 150, // значение лимита по умолчанию
    def_skip: 0, // значение skip по умолчанию
    max_lim: 500, // максимальное значение лимита
    max_skip: 1000000, // максимальное значение skip
	
	maxSessionTime: 1200, // время жизни сессии в секундах
	sessionNameVar: "sid",
	
	SULogin: "admin",    // логин суперпользователя(админа)
    
    fileSize: 200 * 1000 // не больше  200 кб
}