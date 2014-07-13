var mongoose = require("mongoose");
var async = require("async");
var nconf = require("nconf");
var config = require('./config');
var Project = require('./models/Project');
var Task = require('./models/Task');
var User = require('./models/User');
var startup = require('./startup').startDB;
var mongoHost = proccess.env.OPENSHIFT_MONGODB_DB_HOST;
var mongoPort = proccess.env.OPENSHIFT_MONGODB_DB_PORT;

function init(configObject, outerCallback) {

	async.waterfall([ 
		function(cb) {
			//читаем конфиг
			nconf.use('file', {file: './config.json'});
			nconf.load();
			configObject = nconf;
			cb(null, configObject);
		},
		function(configObject, cb) {
			//коннектимся к базе
			var connectionString = configObject.get('db_string');
			//OPENSHIFT setup
			if (mongoHost && mongoPort) {
				connectionString = [
					process.env.OPENSHIFT_MONGODB_DB_USERNAME, ':',
					process.env.OPENSHIFT_MONGODB_DB_PASSWORD, '@',
					mongoHost, ":", mongoPort, "/", "monolith"
				].join("");
			}

			mongoose.connect();

			var cn = mongoose.connection;

			cn.on('open', function(cn) {
				cb(null, cn);
			});

			cn.on('error', function() {
				cb(err);
			})
		},
		function(connection, cb) {
			console.log(connection);
			
			startup.checkAdminExist(connection, cb);
		}
	],	function(err, result) {

		if (err) {
			console.log("ERROR->" + err);
			outerCallback(err);
		} else {
			console.log("ADMIN CHECKED->");
			console.log(result);
			outerCallback(null, configObject);
		}
	})
}

module.exports = {
	Project: Project,
	Task: Task,
	User: User,
	init: init
}
