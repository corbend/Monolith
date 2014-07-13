var mgs = require('mongoose');

var sch = new mgs.Schema({
	'name'			: String,
	'nickname'		: String,
	'fullname'		: String,
	'joined'		: String,
	'passwordHash'	: String,
	'passwordSalt'  : String,
	'email'			: String,
	'groupId'		: Number,
	'currentTask'	: Number
	// 'created'		: Date,
	// 'modified'		: Date,
	// 'deleted'		: Date
});

exports.User = mgs.model('User', sch);