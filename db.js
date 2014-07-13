var mongoose = require("mongoose");
var async = require("async");
var nconf = require("nconf");
var config = require('./config');
var Project = require('./models/Project');
var Task = require('./models/Task');
var User = require('./models/User');
var startup = require('./startup').startDB;

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
			mongoose.connect(configObject.get('db_string'));

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
