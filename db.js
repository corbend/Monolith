var mongoose = require("mongoose");
var async = require("async");

var Project = require('./models/Project');
var Task = require('./models/Task');
var User = require('./models/User');
var startup = require('./startup').startDB;

function init() {
	async.waterfall([ 
		function(cb) {
			mongoose.connect('mongodb://localhost/monolith');
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
			console.log("ERROR->" + err)
		} else {
			console.log("ADMIN CHECKED->");
			console.log(result);
		}
	})
}

module.exports = {
	Project: Project,
	Task: Task,
	User: User,
	init: init
}
