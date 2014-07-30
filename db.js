var mongoose = require("mongoose");
var async = require("async");
var nconf = require("nconf");
var config = require('./config');
var Project = require('./models/Project');
var Task = require('./models/Task');
var User = require('./models/User');
var startup = require('./startup').startDB;
var mongoHost = "127.10.172.130" || process.env.OPENSHIFT_MONGODB_DB_HOST;
var mongoPort = process.env.OPENSHIFT_MONGODB_DB_PORT;
var mongoUsername = "admin" || process.env.OPENSHIFT_MONGODB_DB_USERNAME;
var mongoPassword = "F8DsrVgDCPQn" || process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

function getConnectionConfig(configObject) {

	debugger;
	var connectionString = configObject.get('db_string');
	var development = true;
	//OPENSHIFT setup
	if (mongoHost && mongoPort) {
		development = false;
		connectionString = [
			'mongodb://',
			mongoUsername, ':',
			mongoPassword, '@',
			mongoHost, ":", mongoPort, "/", "monolith"
		].join("");
	}

	var baseConfig = {
		connectionString: connectionString,
		name: "monolith",
		db: "monolith"
	};

	if (development) {

		baseConfig.host = mongoHost;
		baseConfig.port = mongoPort;
		baseConfig.username = mongoUsername;
		baseConfig.password = mongoPassword;
	}

	return baseConfig;
}

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
		
			mongoose.connect(getConnectionConfig(configObject).connectionString);

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
	init: init,
	getConnectionConfig: getConnectionConfig
}
