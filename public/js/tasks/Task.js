define('root/tasks/Task', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'backbone.picky',
	'root/tasks/Create',
	'root/tasks/TaskUsers',
	'root/tasks/Materials'
], function($, _, Backbone, Marionette, Picky,
	Create, TaskUsers, Materials
) {"use strict";
		
	var TaskItem = Marionette.ItemView.extend({
		template: '#task-item-template',
		tagName: 'li',
		className: 'list-group-item',
		events: {
			'click .append-user': 'onTabUsersClick'
		},
		triggers: {
			'click .append-user-btn'		: 'task:users:new',
			'click .task-description-tab'	: 'task:description:show',
			'click .task-header'			: 'task:select'
		},
		templateHelpers: {
			getText: function() {
				return (this.text && marked(this.text)) || '';
			}
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
		initialize: function() {
			var selectable = new Backbone.Picky.Selectable(this);
    		_.extend(this, selectable);
		},
		urlRoot: function() {
			return "projects/" + this.get('projectId') + '/tasks';
		},
		defaults: {
			name: 'Новая задача',
			description: 'Введите описание задачи',
			created: '',
			started: '',
			ended: '',
			status: 1,
			progress: 0
		}
	});

	var Tasks = Backbone.Collection.extend({
		model: Task,
		initialize: function() {
			var singleSelect = new Backbone.Picky.SingleSelect(this);
			_.extend(this, singleSelect);
		},
		url: function() {
			return 'tasks'
		}
	});

	var taskCollection = new Tasks();

	var Toolbar = Marionette.ItemView.extend({
		template: '#task-toolbar-template',
		tagName: 'div',
		className: 'btn-group btn-group-vertical vertical-menu left-sidebar',
		ui: {
			createButton: '.create-task-button'
		},
		triggers: {
			'click .create-task-button': 'create:task',
			'click .delete-task-button': 'delete:task'
		}
	})

	var Controller = Marionette.Controller.extend({
		initialize: function(App) {

			this.App = App;
			this.Materials = {
			 	Controller: new Materials.Controller(App)
			}

			this.App.on('project:show:task', function(projectId, contentRegion) {
				this.App.Router.navigate('/projects/' + projectId + '/tasks');
				this.App.Api.showTasks(projectId, contentRegion);
			}, this);

			this.App.on('task:create', function(projectId) {
				this.App.Router.navigate('/projects/' + projectId + 'tasks/create');
				this.createTask(projectId);
			}, this);

		},
		createTask: function(projectId) {

			console.log("CREATE TASK!");

			var createTaskView = new Create.View({
				model: new Task()
			});

			$('#myModal').modal({
				show: true
			});

			Create.Region.show(createTaskView);

			createTaskView.once('form:before:save', function(model) {
				model.set('projectId', projectId);
			});
			createTaskView.once('form:after:save', function(model) {
				taskCollection.add(model);
			});
		},
		showTasks: function(project, region) {
			var scope = this;
			var projectId = project && project.id;	
			//готовим фильтрующую коллекцию
			var ProjectTasks, projectTasks;

			if (projectId) {

				ProjectTasks = Tasks.extend({
					url: function() {
						return 'projects/' + projectId + "/tasks";
					}
				});
				
				projectTasks = new ProjectTasks();

				projectTasks.listenTo(taskCollection, 'add', function(models) {
					projectTasks.add(models);
				}, projectTasks);

				projectTasks.listenTo(taskCollection, 'remove', function(models) {
					projectTasks.remove(models);
				}, projectTasks);

				projectTasks.listenTo(taskCollection, 'sync', function(models) {
					projectTasks.fetch();
				}, projectTasks);

				projectTasks.listenTo(taskCollection, 'reset', function(models) {
					projectTasks.reset(models);
				});

				projectTasks.on('destroy', function() {
					projectTasks.stopListening(taskCollection);
				});

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

					taskListView.on('childview:task:description:show', function(taskItemView, event) {

						scope.Materials.Controller.workOn(taskItemView, taskItemView.model);
					});

					taskListView.on('childview:task:select', function(taskItemView, event) {

						taskItemView.model.select();
					});

					//выбор записи
					taskListView.listenTo(taskCollection, 'select:one', function(model) {
						debugger;
						if (model) {
							var selectView = taskListView.children.findByModel(model);
							selectView.$el.toggleClass('active');
							scope.App.Task.Selection.set('target', model);
						}
					}, this);

					taskListView.listenTo(taskCollection, 'deselect:one', function(model) {
						var selectView = taskListView.children.findByModel(model);
						if (selectView) {
							selectView.$el.removeClass('active');
							scope.App.Task.Selection.set('target', null);
						}
					}, this);

					// Materials.Controller.showMaterials();
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