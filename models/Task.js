var mgs = require('mongoose');

var sch = new mgs.Schema({
	'name'			: String,
	'description'	: String,
	'projectId'		: String,
	'users'			: Array
	// 'created'		: Date,
	// 'modified'		: Date,
	// 'deleted'		: Date
});

exports.Task = mgs.model('Task', sch);