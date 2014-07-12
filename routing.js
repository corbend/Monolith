var crypto = require('crypto');

var Project = require('./models/Project').Project;
var Task = require('./models/Task').Task;
var User = require('./models/User').User;

exports.route = function(eApp) {
	eApp.get("/", function(req, res) {
		//FIXME - переместить файл в паблик
		res.sendfile("main.html");
	});

	eApp.get('/projects', function(req, res) {

		Project.find(function(err, projects) {
			if (err) {
				console.log(err);
			} else {
				res.send(projects);
			}
		});
	});

	eApp.post('/projects', function(req, res) {
		var m = new Project({
			name: req.body.name,
			description: req.body.description
		});
		m.save(function(err, model) {
			res.send(model);
		});
	});

	eApp.get('/tasks', function(req, res) {
		
		Task.find(function(err, tasks) {
			if (err) {
				console.log(err);
			} else {
				res.send(tasks);
			}
		});
	});

	eApp.get(/\/projects\/(.*)\/tasks$/, function(req, res) {
		console.log(req.params);
		console.log(req.params[0]);

		Task.find({projectId: req.params[0]}, function(err, tasks) {
			if (err) {
				console.log(err);
			} else {
				res.send(tasks);
			}
		});
	});

	eApp.post(/\/projects\/(.*)\/tasks$/, function(req, res) {

		var m = new Task({
			projectId: req.params[0],
			name: req.body.name,
			description: req.body.description
		});
		m.save(function(err, model) {
			res.send(model);
		});
	});

	eApp.get('/users', function(req, res) {
		User.find(function(err, users) {
			if (err) {
				console.log(err);
			} else {
				res.send(users);
			}
		});
	});

	eApp.post('/users', function(req, res) {

		crypto.pbkdf2(req.body.password, function(err, result) {
			if (err) {
				res.send({message: 'password not saved', success: false})
			} else {
				var m = new User({
					name: req.body.name,
					passwordHash: result.key,
					passwordSalt: result.salt,
					groupId: req.body.groupId
				});

				m.save(function(err, model) {
					res.send({
						_id: model._id,
						name: model.name
					});
				});
			}
		});

	});
};