
var UserApi = require('./users/api').Api;
var User = require('./models/User').User;

var adminDefaultName = "admin";

function createAdmin(connection, cb) {
	var password = 'admin1234567890';
	console.log("SUPERADMIN NOT FOUND!");
    console.log("CREATE SUPERADMIN!");

    UserApi.createUser(adminDefaultName, password, cb);
}

function checkAdminExist(connection, cb) {
	User.find({name: adminDefaultName}, function(err, admin) {

		if (admin.length) {
			cb(err, admin);
		} else {
			createAdmin(connection, cb);
		}
	})
}

exports.startDB = {
	checkAdminExist: checkAdminExist,
	createAdmin: createAdmin
}