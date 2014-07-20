var crypto = require('crypto');
var fs = require('fs');
var conf = require('nconf');
var path = require('path');
var mv = require('mv');
var uuid = require('node-uuid');
var mgs = require('mongoose');

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
		console.log("PAGING=" + req.body.page);
		console.log("LIMIT=" + req.body.limit);

		if (req.body.page && req.body.limit) {
			//TODO - pagination
		} 
		else if (req.body.filterQuery) {
			//фильтрация по имени или номеру задачи/проекта
			Project.find({name: req.body.filterQuery})
			.or({number: req.body.filterQuery})
			.exec(function(err, projects) {
				if (!err) {
					res.send(projects);
				}
			})
		} else {
			Project.find(function(err, projects) {
				console.log("PROJECTS");
				console.log(projects);
				if (err) {
					console.log(err);
				} else {
					res.send(projects);
				}
			});
		}
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

	eApp.post(/\/projects\/(.*)\/files$/, function(req, res) {
		Project.find(req.params[0], function(err, project) {
			if (!err) {
				console.log(req.body);
				//TODO - проверка на существование файла
				var fileName = req.body.name || "file" + uuid.v4();
				var pathToFile = path.join(__dirname, conf.get('mediaDir'), fileName);
				var files = [];

				if (!fs.existsSync(pathToFile) && project) {

					if (!project.files) {
						project.files = [];
					}
					console.log("FILE->");
					console.log(req.files);
					for (var f in req.files) {
						console.log("FILE->");
						console.log(req.files[f]);
						files.push(fileName);
						var tempPath = req.files[f].path;

						mv(tempPath, pathToFile, function(err) {
					        if (err) throw err;
				            
					        Project.findOneAndUpdate(
								{_id: project._id},
								{$set: {files: files}}, function(err, updated) {
								if (!err) {
									res.send({success: true, message: 'Файл успешно добавлен!'});
								} else {
									res.render('error', {status: 500});
								}
							});
					    });
					}

				} else {
					res.send({success: true, message: 'Файл с таким именем существует!'});
				}

			} else {
				res.render('error', {status: 500});
			}
		});
	});

	eApp.get(/\/projects\/(.*)\/files$/, function(req, res) {
		
		Project.find(req.params[0], function(err, project) {
			if (err) {
				res.render('error', {status: 500});
			} else {
				if (project) {
					res.send(JSON.stringify(project.files || []));
				}
			}
		});
	});

	eApp.put('/projects/:id', function(req, res) {
		var projectId = req.params.id;

		Project.findOneAndUpdate(projectId, {$set: req.body},
			function(err, projectToUpdate) {

				if (!err && projectToUpdate) {
					return res.send(projectToUpdate);
				} else {
					console.log(err);
					res.render('error', {status: 500});
				}
			}
		);
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