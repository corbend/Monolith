var mgs = require('mongoose');

var sch = new mgs.Schema({
	'name'			: String,
	'description'	: String
	// 'created'		: Date,
	// 'modified'		: Date,
	// 'deleted'		: Date
});

exports.Project = mgs.model('Project', sch);