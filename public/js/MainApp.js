define('root/MainApp', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'root/service/Selection',
	'root/navmenu/NavMenu',
	'root/projects/Projects',
	'root/tasks/Task',
	'root/users/Users',

	'root/base/SearchField'
], function($, _, Backbone, Marionette, Selection,
	NavMenu, Project, Task, User,
	SearchField
) {"use strict";
		
	var App = new Marionette.Application();

	App.addRegions({
		mainRegion: '#main-region'
	});

	App.getProjectCount = _.bind(function() {
		return this.Project.Collection.length;
	}, App);

	App.getTaskCount = _.bind(function() {
		return this.Task.Collection.length;;
	}, App);

	App.getUserCount = _.bind(function() {
		return this.User.Collection.length;;
	}, App)

	//SELECTION MECHANISM--

	App.SingleSelection = Selection.Single;
	App.MultiSelection = Selection.Multi;

	App.getSelection = _.bind(function() {
		this.SingleSelection.get('target');
	}, App);

	App.listenTo(App.SingleSelection, 'change:target', function() {

	});
	//--SELECTION MECHANISM

	App.listenTo(App.MultiSelection, 'change', function() {
		//TODO - stub;
	});


	var Router = Marionette.AppRouter.extend({
		appRoutes: {
			'/projects'				: 'showProjects',
			'/projects/:id/tasks'	: 'showTasks'
		}
	});

	App.addInitializer(function() {
		this.Project = {
			Collection: Project.Collection,
			Controller: new Project.Controller(App)
		}
		this.Task = {
			Collection: Task.Collection,
			Controller: new Task.Controller(App)
		}
		this.Task.Selection = Selection.Task;

		this.User = {
			Collection: User.Collection,
			Controller: new User.Controller(App)
		}


		this.Project.Controller.listenTo(App, 'project:edit', function(selectedProject) {
			this.editProject(selectedProject);	
		}, this.Project.Controller);
	})

	var MenuRegion = Marionette.Region.extend({
		el: '#main-menu-region'
	})

	var GenericAPI = {
		createMainLayout: function() {
			var scope = this;

			var layout = new Layout();
			App.mainRegion.show(layout);

			var menuRegion = new MenuRegion();

			NavMenu.Collection.forEach(function(mi) {

				switch (mi.get('position')) {
					case 1:
						mi.set('count', App.getProjectCount());
						break;
					case 2:
						mi.set('count', App.getTaskCount());
						break;
					case 3:
						break;
					case 4:
						mi.set('count', App.getUserCount());
						break;
				}
			})

			var menuView = new NavMenu.View({
				collection: NavMenu.Collection
			});

			menuRegion.show(menuView);

			menuView.on('childview:menu:select', function(item) {
				menuView.$('li').removeClass('active');
				item.$el.toggleClass('active');
				switch(item.model.get('position')) {
					case 1:
						scope.showProjects(layout);
						break;
					case 2:
						//показываем все таски
						scope.showTasks(null, layout);
						break;
					case 4:
						scope.showUsers(layout);
						break;
				}
			});

			var projectSearchRegion = new Marionette.Region({
				el: "#project-search-region"
			})

			projectSearchRegion.show(new SearchField({
				placeholderText: 'Введите название/номер проекта или задачи',
				searchCollection: function() {
					return App.Project.Collection;
				}
			}))

			return layout;
		},
		showProjects: function(layout) {
			var layout = layout || this.createMainLayout();

			var toolbar = new Project.Toolbar();
			layout.toolbarRegion.show(toolbar);

			Project.Collection.fetch({
				success: function() {
					var projectView = App.Project.Controller.showProjects(layout.contentRegion);
					layout.contentRegion.show(projectView);

					toolbar.on('project:edit', function() {
						var selectedProject = projectView.getSelected();
						if (selectedProject) {
							App.trigger('project:edit', selectedProject);
						} else {
							alert("Выберите проект");
						}
					});

					toolbar.on('project:delete', function() {
						var selectedProject = projectView.getSelected();
						if (selectedProject) {
							App.Project.Controller.moveToArchive(selectedProject);
						}
					})

					projectView.once('destroy', function() {
						toolbar.off('project:edit');
						toolbar.stopListening();
					})
				}
			})


			
		},
		createTaskToolbar: function(mainLayout, associatedProjectId) {

			var toolbar = new Task.Toolbar();
			mainLayout.toolbarRegion.show(toolbar);

			toolbar.on('create:task', function() {
				App.trigger('task:create', associatedProjectId);
			});

			toolbar.on('delete:task', function() {
				var task = App.Task.Selection.get('target');
				task.destroy();
				App.trigger('task:delete', associatedProjectId);
			});
		},
		showTasks: function(projectId) {

			var layout = this.createMainLayout();
			var project;

			project = App.Project.Controller.getProjectById(projectId);

			App.Task.Controller.showTasks(project, layout.contentRegion);

			this.createTaskToolbar(layout, projectId);
		},
		showUsers: function() {

			var layout = layout || this.createMainLayout();

			App.User.Controller.showUserList(layout.contentRegion);
			layout.toolbarRegion.show(new User.Toolbar());
		}
	}

	App.addInitializer(function() {
		this.Router = new Router({
			controller: GenericAPI
		})
	});

	App.addInitializer(function() {
		$.when(true).then(function() {
			var df = $.Deferred();
			User.Collection.fetch({
				success: function() {
					df.resolve();
				}
			});
			return df.promise();
		}).then(function() {
			var df = $.Deferred();
			Project.Collection.fetch({
				success: function() {
					df.resolve();
				}
			});
			return df.promise();
		}).then(function() {
			var df = $.Deferred();
			Task.Collection.fetch({
				success: function() {
					df.resolve();
				}
			});
			return df.promise();
		}).done(function() {

			$(function() {
				Backbone.history.start();
				GenericAPI.showProjects();
			});

		}).fail(function() {
			console.log("error loading collections!");
		});
	});

	App.Api = GenericAPI;
	// App.showProjects = GenericAPI.showProjects;
	// App.showTasks = GenericAPI.showTasks;
	// App.showUsers = GenericAPI.showUsers;

	// _.bindAll(App, 'showUsers', 'showProjects', 'showTasks');

	var Layout = Marionette.LayoutView.extend({
		template: '#main-layout',
		id: 'main-layout',
		regions: {
			// headerRegion: '#header-region',
			menuRegion: '#main-menu-region',
			toolbarRegion: '#toolbar-region',
			// tasksRegion: '#tasks-region',
			// timeLineRegion: '#timeline-region',
			contentRegion: '#content-region'
		}
	});

	// App.on('start', function() {
	// 	Backbone.history.start();

	// 	GenericAPI.showProjects();
	// });
		
	App.reqres.setHandler('projects', function() {
		return Project.Collection;
	});


	Cufon.replace('.brand', {
		fontFamily: 'YonderRecoil-Regular',
		textShadow: '0px 0px 25px white'
	});

	return App;
})