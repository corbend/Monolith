define('root/projects/Create', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'backbone.syphon',
	'root/projects/views/CreateSuccess'

], function($, _, Backbone, Marionette, Syphon,
	CreateSuccess
) {"use strict";
	
	var Region = Marionette.Region.extend({
		el: '#create-project-region'
	})

	var View = Marionette.ItemView.extend({

		template: '#create-project-template',
		className: 'full-range',
		events: {
			'click .save-button': 'onSaveProject'
		},
		onRender: function() {

		},
		onSaveProject: function(event) {

			var scope = this;

			event.preventDefault();
			
			var data = Syphon.serialize(this);
			this.model.set(data);

			this.model.once('sync', function() {
				console.log("model saved!");
				this.trigger('form:saved', this.model);
			}, this);

			this.model.once('error', function(errors) {
				console.log("model error!");
				this.trigger('form:error', this.model);
			}, this);

			this.model.save();
		}
	});

	var Controller = Marionette.Controller.extend({

		initialize: function(App) {

			this.App = App;

		},
		createProject: function(newProject) {

			var scope = this;

			var createView = new View({
				model: newProject
			});

			//FIXME - если создать единожды экземпляр региона в модуле то вьюха почем-то не появляется
			var region = new Region();
			region.show(createView);

			this.listenTo(createView, 'form:saved', function() {
				scope.onCreateSuccess(region, new newProject.constructor());
			}, this);

		},
		onCreateSuccess: function(createFormRegion, projectModel) {

			//после создания проекта выводим уведомление, что проект успешно создан и 
			//по клике на кнопке можно создать еще один.
			var scope = this;

			var projectsCollection;

			projectsCollection = this.App.request('projects');

			projectsCollection.fetch({reset: true});

			var successView = new CreateSuccess({
				title: 'Проект успешно создан'
			});

			successView.on('create:repeat', function() {
				scope.createProject(projectModel);
			});

			createFormRegion.show(successView);
		}
	});

	return {
		Controller: Controller,
		View: View,
		Region: Region
	}
});