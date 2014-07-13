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

function checkPassword(user, password, cb) {

	if (!user || !user.passwordSalt || !password) {
		return cb(null, false, { message: 'Ошибка авторизации!'});
	}

	var buf = new Buffer(user.passwordSalt, 'hex');

	crypto.pbkdf2(password, buf, 1000, 64, function(err, key) {

		if (!err && user.passwordHash == key.toString("hex")) {
			console.log("PASS RIGHT!");
			cb(null, {success: true, message: '', data: {
				username: user.username
			}});
		} else {
			console.log("PASS WRONG!");
			cb(null, false, {message: 'Неверный пароль!'});
		}
	});

}

exports.Api = {
	createUser: createUser,
	checkPassword: checkPassword
}