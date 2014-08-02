define('root/projects/Projects', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'root/base/ConfirmWindow',
	'root/projects/views/CreateSuccess',
	'root/projects/Create',
	'root/projects/Edit',
	'root/projects/Materials',
	'root/comments/Comments',
	'root/projects/Files'
], function($, _, Backbone, Marionette, 
	ConfirmWindow, CreateSuccess,
	Create, Edit, Materials, Comments, Files
) {"use strict";

	var ProjectStatuses = [
		'START', 'DELAY', 'FROZEN', 'END', 'DEAD' 
	];

	var Project = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: 'projects',
		defaults: {
			name: '',
			description: '',
			projectText: '',
			created: 0,
			closed: 0,
			progress: 0,
			status: 1
		}
	});

	var Projects = Backbone.Collection.extend({
		model: Project,
		url: function() {return 'projects';}
	});

	var ArchivedProjects = Backbone.Collection.extend({
		model: Project,
		url: function() {return 'project?archive=true'}
	});

	var projects = new Projects();
	var archivedProjects = new ArchivedProjects();

	var ProjectItem = Marionette.ItemView.extend({
		template: '#project-item-template',
		tagName: 'tr',
		ui: {
			selectBox: 'input[type="checkbox"]'
		},
		events: {
			'click .btn': 'onShowTaskBtnClick',
			'click input[type="checkbox"]': 'onSelectProject'
		},
		modelEvents: {
			'change:selected': 'onSelect' 
		},
		templateHelpers: {
			'getStartedTime': function() {
				return new Date(this.created).toLocaleString();
			}
		},
		onSelect: function(model, val) {

			if (val) {
				this.ui.selectBox.attr('checked', 'checked');
				this.$el.addClass('active');
			} else {
				this.ui.selectBox.removeAttr('checked');
				this.$el.removeClass('active');
			}
		},
		onSelectProject: function(event) {

			var selectedModel = this.model;
			selectedModel.set('selected', !selectedModel.get('selected'));

			this.trigger('item:select', selectedModel);

			selectedModel.collection.forEach(function(m) {
				if (m !== selectedModel) {
					m.set('selected', false);
				}
			});

		},
		onShowTaskBtnClick: function(e) {
			this.trigger('show:task', this.model);
		}
	});

	var ProjectView = Marionette.CompositeView.extend({

		template: '#projects-list-template',
		className: 'panel panel-normal',
		childView: ProjectItem,
		childViewContainer: 'tbody',

		events: {

			'click a[href="#js-project-create"]': 'onInfoTabActivate',
			'click a[href="#js-project-content"]': 'onMaterialTabActivate',
			'click a[href="#js-project-files"]': "onFilesTabActivate", 
		},
		
		onInfoTabActivate: function(event) {

			//когда активируется вкладка создания нового проекта
			this.trigger('create:project');
			
		},
		onMaterialTabActivate: function(event) {

			var selectedProject = this.getSelected();

			Materials.Controller.showLayout();

			this.trigger('tab:material:activate', selectedProject);

		},
		onFilesTabActivate: function(event) {

			var selectedProject = this.getSelected();
			this.trigger('tab:files:activate', selectedProject);
		},
		getSelected: function() {
			var selected = this.collection.filter(function(m) {
				return m.get('selected');
			});

			return selected.length ? selected[0]: null;
		}
	});

	var Toolbar = Marionette.ItemView.extend({
		template: '#project-toolbar-template',
		tagName: 'div',
		className: 'btn-group btn-group-vertical vertical-menu left-sidebar',
		triggers: {
			'click .btn-default': 'texteditor:show',
			'click .edit-project-button': 'project:edit',
			'click .delete-project-button': 'project:delete'
		}
	})

	var Controller = Marionette.Controller.extend({

		initialize: function(App) {
			this.App = App;
			this.Comments = Comments;
			this.Materials = Materials;
			this.Files = Files;

			this.Create = {
				Controller: new Create.Controller(App)
			}

			this.Comments.Controller = new Comments.Controller(App);
			this.Files.Controller = new Files.Controller(App);
		},
		getProjectById: function(id) {
			return projects.get(id);
		},
		editProject: function(project) {
			var editView = new Edit.View({
				model: project
			});

			editView.render();

			this.listenTo(editView, 'form:saved', function() {
				projects.fetch({reset: true});
			}, this);
		},
		moveToArchive: function(project) {

			var confirmMessage = new ConfirmWindow({
				el: '#confirmModal',
				title: 'Внимание',
				text: 'Вы хотите поместить проект в архив?',
				onOK: function() {
					project.set('archive', true);
					project.save();
				}
			})

			confirmMessage.render();

		},
		createMenu: function(projectView, menuContainer) {

			var ProjectMenu = Marionette.ItemView.extend({
				el: menuContainer,
				template: false,
				triggers: {
					'click .show-projects-menu-link': 'show:projects',
					'click .show-archive-menu-link' : 'show:archive'
				}
			});

			var menu = new ProjectMenu();

			menu.on('show:projects', function() {

				this.showProjects();
			}, this);

			menu.on('show:archive', function() {

				this.showArchive();
			}, this);

			return menu;
		},
		showArchive: function() {

			var projectView = new ProjectView({
				collection: archivedProjects
			});
			projectView.on('render', function() {
				this.createMenu(projectView, projectView.$(".project-menu"));
			}, this);
		},
		showProjects: function(contentRegion) {

			var scope = this;
			var projectView = new ProjectView({
				collection: projects
			});

			projectView.on('render', function() {
				this.createMenu(projectView, projectView.$(".project-menu"));
			}, this);

			projectView.on('childview:show:task', function(childView, projectModel) {
				this.App.trigger("project:show:task", projectModel.id, contentRegion);
			}, this);

			projectView.on('create:project', function() {
				debugger;
				this.Create.Controller.createProject(new Project());
			}, this);

			//TODO - проверить на зомби представления
			this.listenTo(projects, 'change:selected', function(projectModel, value) {

				if (value) {
					console.log("SELECT PROJECT");
					console.log(projectModel);
					this.App.trigger("project:select", projectModel);
					this.Comments.Controller.showProjectCommentsList(projectModel);
					this.Files.Controller.showFiles(projectModel);
					this.Materials.Controller.setProject(projectModel);
					this.Materials.Controller.showLayout();
				}
			}, this);


			projectView.on('tab:material:activate', function(selectedProject) {
				console.log("Activate Materials");
				if (selectedProject) {
					scope.Comments.Controller.showProjectCommentsList(selectedProject);
				} else {
					scope.Comments.Controller.showWarningMessage();
				}

				scope.Materials.Controller.showLayout();

			}, this);

			projectView.on('tab:files:activate', function(selectedProject) {
				if (selectedProject) {
					scope.Files.Controller.showFiles(selectedProject);
				}
			});

			projectView.on('show', function() {
				scope.Materials.Controller.showLayout();
			});

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