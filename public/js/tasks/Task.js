define('root/tasks/Task', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'root/tasks/Create',
	'root/tasks/TaskUsers'
], function($, _, Backbone, Marionette,
	Create, TaskUsers
) {"use strict";
		
	var TaskItem = Marionette.ItemView.extend({
		template: '#task-item-template',
		tagName: 'li',
		className: 'list-group-item',
		events: {
			'click .append-user': 'onTabUsersClick'
		},
		triggers: {
			'click .append-user-btn': 'task:users:new' 
		},
		onTabUsersClick: function(event) {
			this.trigger('task:users:show', event);
		}
	});

	var TaskEmpty = Marionette.ItemView.extend({
		template: '#task-empty-template'
	})

	var TasksView =	Marionette.CollectionView.extend({
		tagName: 'ul',
		className: 'list-group',
		childView: TaskItem,
		emptyView: TaskEmpty,
		triggers: {
			'click #create-task-button': 'task:create'
		}
	})

	var Task = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: function() {
			return "projects/" + this.get('projectId') + '/tasks';
		},
		defaults: {
			name: 'Новая задача',
			description: 'Введите описание задачи',
			started: '',
			ended: '',
			status: 'START',
			progress: '0%'
		}
	});

	var Tasks = Backbone.Collection.extend({
		model: Task,
		url: function() {
			return 'tasks'
		}
	});

	var taskCollection = new Tasks();

	var Toolbar = Marionette.ItemView.extend({
		template: '#task-toolbar-template',
		tagName: 'div',
		className: 'btn-group btn-group-vertical'
	})

	var Controller = Marionette.Controller.extend({
		initialize: function(App) {

			this.App = App;

			this.App.on('project:show:task', function(projectId, contentRegion) {
				this.App.Router.navigate('/projects/' + projectId + '/tasks');
				this.showTasks(projectId, contentRegion);
			}, this);

			this.App.on('task:create', function(projectId) {
				this.App.Router.navigate('/projects/' + projectId + 'tasks/create');
				this.createTask(projectId);
			}, this);
		},
		createTask: function(projectId) {
			var createTaskView = new Create.View({
				model: new Task()
			});

			Create.Region.show(createTaskView);

			createTaskView.once('form:before:save', function(model) {
				model.set('projectId', projectId);
			});
		},
		showTasks: function(projectId, region) {
			var scope = this;
					
			//готовим фильтрующую коллекцию
			var ProjectTasks, projectTasks;

			if (projectId) {
				ProjectTasks = Tasks.extend({
					url: function() {
						return 'projects/' + projectId + "/tasks";
					}
				});
				
				projectTasks = new ProjectTasks();

			} else {
				projectTasks = taskCollection;
			}

			projectTasks.fetch({
				success: function() {

					var taskListView = new TasksView({
						collection: projectTasks
					})

					region.show(taskListView);

					//если нажали на кнопку создания нового таска
					taskListView.on('task:create', function(event) {

						$('#myModal').modal({
							show: true
						});

						scope.App.trigger('task:create', projectId);
					}, scope);

					taskListView.on('childview:task:users:show', function(taskView, event) {
						var taskId = taskView.model.id;
						scope.App.Router.navigate('tasks/' + taskId + '/users');
						var region = new Marionette.Region({
							el: taskView.$('.task-users-content')
						});
						TaskUsers.Controller.showTaskUsers(region, taskId);
					}, scope);

					taskListView.on('childview:task:users:new', function(taskView, event) {

						var taskId = taskView.model.id;
						scope.App.Router.navigate('tasks/' + taskId + '/users/new');
						TaskUsers.Controller.showAppendForm(taskView.model);
					}, scope);
				}
			})
				
		}
	});

	return {
		Collection: taskCollection,
		Controller: Controller,
		Toolbar: Toolbar
	}
});