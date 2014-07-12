var mgs = require('mongoose');

var sch = new mgs.Schema({
	'name'			: String,
	'nickname'		: String,
	'joined'		: String,
	'passwordHash'	: String,
	'passwordSalt'  : String,
	'currentTask'	: Number,
	'tasks'			: Array 
	// 'created'		: Date,
	// 'modified'		: Date,
	// 'deleted'		: Date
});

exports.User = mgs.model('User', sch);