define('root/sentinel/Sentinel', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'root/navmenu/NavMenu',
	'root/projects/Projects',
	'root/tasks/Tasks',
	'root/welcome/Features'
], function($, _, Backbone, Marionette, 
	NavMenu, Projects, Tasks, Features
) {"use strict";

	var projects = Projects.Collection;

	var projectsList = new Features.FeatureGrid({
		collection: projects
	});

	var tasksList = new Features.FeatureList({
		collection: tasks
	});

	var Controller = Marionette.Controller.extend({
		initialize: function(App) {
			this.App = App;
		},
		rebuildMenu: function() {
			this.App.leftMenu.show(new NavMenu.View({
				collection: NavMenu.Collection
			}));
		},
		activate: function() {
			this.App.clearScreen();

			this.rebuildMenu();

			this.App.mainContent.show(projectList);
			this.App.rightMenu.show(tasksList);
		}
	});


	return {
		Controller: Controller
	}
});