var mgs = require('mongoose');
var Project = require('./Project').Project;
var Task = require('./Task').Task;

var sch = new mgs.Schema({
	'userId' 		: String,
	'projectId'		: String,
	'postDate'		: Date,
	'text'			: String,
	'created'		: { type: Date, default: Date.now},
	'updated'		: Date,
	'deleted'		: Date
});

exports.Comment = mgs.model('Comment', sch);