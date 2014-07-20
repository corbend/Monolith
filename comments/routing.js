
var Comment = require('../models/Comment').Comment;
var User = require('../models/User').User;
var Project = require('../models/Project').Project;
var Task = require('../models/Task').Task;
var async = require('async');
var mongoose = require('mongoose');

exports.route = function(eApp) {

	eApp.get('/comments', function(req, res) {

		Comment.find(function(err, projects) {
			if (err) {
				console.log(err);
			} else {
				res.send(projects);
			}
		});
	});

	eApp.get(/\/projects\/(.*)\/comments/, function(req, res) {
		var projectId = req.params[0];
		async.waterfall([
			function(cb) {
				Project.findById(req.params[0], function(err, project) {
					cb(err, project);
				});
			},
			function(project, cb) {
				if (project) {
					Comment.find({projectId: project._id}, function(err, comment) {
						cb(err, comment);
					});
				} else {
					cb(null, []);
				}
			}
		], function(err, comments){
			if (!err) {
				res.send(comments);
			} else {
				res.send({success: false, message: err.message});
			}
		});
	});

	eApp.get(/\/tasks\/(.*)\/comments/, function(req, res) {
		async.waterfall([
			function(cb) {
				Task.findById(req.params[0], function(err, task) {
					cb(err, task);
				});
			},
			function(task, cb) {
				Comment.find({taskId: task._id}, function(err, comment) {
					cb(err, comment);
				});
			}
		], function(err, comments){
			if (!err) {
				res.send(comments);
			} else {
				res.send({success: false, message: err.message});
			}
		});
	});

	eApp.post('/comments', function(req, res) {

		async.waterfall([
			function(cb) {
				User.findById(req.body.userId, function(err, user) {
					cb(err, user);
				});
			},
			function(user, cb) {
				Project.findById(req.body.projectId, function(err, project) {
					cb(err, user, project);
				});
			},
			function(user, project, cb) {

				if (user && project) {
					var m = new Comment({
						userId: user._id,
						projectId: project._id, 
						text: req.body.text,
						postDate: req.body.postDate
					});

					m.save(function(err, model) {
						cb(err, model);
					});
				} else {
					throw Error("No user or project!");
				}
			}
		], function(err, result) {
			if (!err) {
				res.send(result);
			} else {
				res.send({success: false, message: err.toString()})
			}
			
		});

	});

	eApp.delete('/comments/:id', function(req, res) {
		Comment.delete(req.params[0], function(err, deleted) {
			if (!err) {
				res.send({success: true, message: ''})
			} else {
				res.send({success: false, message: 'Не удалось удалить комментарий!'});
			}
		})
	});
};
