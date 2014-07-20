define('root/MainApp', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'root/navmenu/NavMenu',
	'root/projects/Projects',
	'root/tasks/Task',
	'root/users/Users'
], function($, _, Backbone, Marionette,
	NavMenu, Project, Task, User
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
		this.User = {
			Collection: User.Collection,
			Controller: new User.Controller(App)
		}
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

			return layout;
		},
		showProjects: function(layout) {
			var layout = layout || this.createMainLayout();

			Project.Collection.fetch({
				success: function() {
					layout.contentRegion.show(App.Project.Controller.showProjects(layout.contentRegion));
				}
			})
			var toolbar = new Project.Toolbar();
			layout.toolbarRegion.show(toolbar);
		},
		showTasks: function(projectId, layout) {

			var layout = layout || this.createMainLayout();
			var project;

			project = App.Project.Controller.getProjectById(projectId);

			App.Task.Controller.showTasks(project, layout.contentRegion);
			layout.toolbarRegion.show(new Task.Toolbar());
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

	return App;
})