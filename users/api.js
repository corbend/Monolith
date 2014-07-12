var crypto = require('crypto');
var User = require('../models/User').User;

function createUser(username, password, cb) {
	//генерируем соль
    var salt = crypto.randomBytes(64, function(err, buf) {
    	if (err) {cb(err)}
    	else {
    		//создаем хеш пароля
    		crypto.pbkdf2(password, buf, 1000, 64, function(err, key) {

				User.create({
					name: username,
					passwordHash: new Buffer(key).toString("hex"),
					passwordSalt: buf.toString("hex"),
					joined: new Date()
				}, function(err, admin) {
					cb(err, admin);
				});
			});
    	}
    }) 

}

exports.Api = {
	createUser: createUser
}