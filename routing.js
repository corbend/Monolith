var crypto = require('crypto');

var Project = require('./models/Project').Project;
var Task = require('./models/Task').Task;
var User = require('./models/User').User;

var UserApi = require('./users/api').Api;

function isAuth(req, res, next) {

	if (req.isAuthenticated()) {
		console.log("Authenticated OK!");
		next();
	} else {
		res.redirect("/auth");
	}
}

exports.route = function(eApp) {

	eApp.get("/", isAuth, function(req, res) {
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

	eApp.get(/\/tasks\/(.*)\/users$/, function(req, res) {

		Task.find({_id: req.params[0]}, function(err, tasks) {
			if (err) {
				console.log(err);
			} else {
				User.where('_id').in(tasks[0].users).exec(
					function(err, users) {
						console.log(users);
						if (!err) {
							res.send(users);
						} else {
							res.send({success: false, message: 'error'})
						}
					}
				);
			}
		});

	});

	eApp.put(/\/projects\/(.*)\/tasks\/(.*)/, function(req, res) {
		var taskId = req.params[1];
		console.log("UPDATE TASK!" + taskId);

		console.log(req.body);
		console.log(req.body.users);
		Task.update({_id: taskId}, {users: req.body.users}, function(err, taskUpdated) {
			if (err) {
				res.send({success: false, error: err.message});
			} else {
				res.send(taskUpdated);
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

		var data = {
			fullname: req.body.fullname,
			groupId: req.body.groupId,
			email: req.body.email
		}

		var errors;

		if (!req.body.name) {
			errors = errors || {};
			errors['name'] = 'Не задано обязательное поле!';
		}

		if (!req.body.password) {
			errors = errors || {};
			errors['password'] = 'Не задано обязательное поле!';
		}

		if (errors) {
			res.send({success: false, errors: errors});
			return;
		}

		UserApi.createUser(req.body.name, req.body.password, function(err, result) {
			if (!err) {
				res.send({success: true})
			} else {
				console.log("USER SAVE ERROR!");
				console.log(err);
				res.send({success: false, message: 'Ошибка при сохранении пользователя!'})
			}
		}, data);

	});
};