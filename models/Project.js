var mgs = require('mongoose');
var User = require('./Task.js').Task;

var sch = new mgs.Schema({
	'name'			: String,
	'description'	: String,
	'projectText'	: {type: String},
	'created'		: {type: Date, default: Date.now},
	'deleted'		: {type: Date},
	'updated'		: {type: Date},
	'status'		: Number,
	'progress'		: Number,
	'files'			: Array
});

sch.avgProgress = function(cb) {
	//вычисление среднего прогресса выполнения для проекта
	Task.find({projectId: this.model._id}, function(err, tasks) {
		if (!err) {
			var overallProgress = 0;
			tasks.forEach(function(t) {
				overallProgress += t.progress;
			});
			var result = overallProgress / task.length;
			cb(null, result);
		} else {
			cb(err);
		}
	})
}

exports.Project = mgs.model('Project', sch);