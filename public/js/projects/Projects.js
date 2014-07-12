define('root/projects/Projects', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'root/projects/Create'
], function($, _, Backbone, Marionette, 
	Create
) {"use strict";
		
	var TimePoint = Backbone.Model.extend({

	});

	var TimeLine = Backbone.Collection.extend({
		model: TimePoint
	});

	var TimeLineView = Marionette.CollectionView.extend({
		className: 'panel panel-default',
	});

	var ProjectStatuses = [
		'START', 'DELAY', 'FROZEN', 'END', 'DEAD' 
	];

	var Project = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: 'projects',
		defaults: {
			name: '',
			shortDescription: '',
			startedTime: 0,
			endedTime: 0,
			progress: '0%',
			status: 'START'
		}
	});

	var Projects = Backbone.Collection.extend({
		model: Project,
		url: function() {return 'projects';}
	});

	var projects = new Projects();

	var ProjectItem = Marionette.ItemView.extend({
		template: '#project-item-template',
		tagName: 'tr',
		events: {
			'click .btn': 'onShowTaskBtnClick'
		},
		onShowTaskBtnClick: function(e) {
			this.trigger('show:task', this.model);
		}
	});

	var ProjectView = Marionette.CompositeView.extend({
		template: '#projects-list-template',
		className: 'panel panel-info',
		childView: ProjectItem,
		childViewContainer: 'tbody',
		events: {
			'click a[href="#js-project-create"]': 'onInfoActivate'
		},
		onInfoActivate: function(event) {
			//когда активируется вкладка создания нового проекта

			var createView = new Create.View({
				model: new Project()
			});
			Create.Region.show(createView);

			this.listenTo(createView, 'form:saved', function() {
				projects.fetch({reset: true});
			}, this);
		}
	});

	var Toolbar = Marionette.ItemView.extend({
		template: '#project-toolbar-template',
		tagName: 'div',
		className: 'btn-group btn-group-vertical'
	})

	var Controller = Marionette.Controller.extend({
		initialize: function(App) {
			this.App = App;
		},
		getProjectById: function(id) {
			return projects.get(id);
		},
		showProjects: function() {

			var projectView = new ProjectView({
				collection: projects
			});

			projectView.on('childview:show:task', function(childView, projectModel) {
				this.App.trigger("project:show:task", projectModel.id);
			}, this);

			return projectView;
		},
		getNumberOfWorkers: function() {

		},
		getLongestTask: function() {

		},
		filterCompleted: function() {

		}
	});

	return {
		Controller: Controller,
		Collection: projects,
		Toolbar: Toolbar
	}
});