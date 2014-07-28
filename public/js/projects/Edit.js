define('root/projects/Edit', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'backbone.syphon'
], function($, _, Backbone, Marionette, Syphon) {"use strict";
	
	// var Region = Marionette.Region.extend({
	// 	el: '#edit-project-region'
	// });

	// var region = new Region();

	var FormView = Marionette.ItemView.extend({
		template: '#edit-project-template',
		className: 'full-range'
	});

	var View = Marionette.ItemView.extend({
		el: '#project-edit-modal',
		template: '#modal-dialog-template',
		ui: {
			title: '.modal-title',
			body: '.modal-body'
		},
		events: {
			'click .save-button': 'onSaveProject'
		},
		onRender: function() {

			this.$el.modal({show: true});

			var formView = new FormView();

			formView.render().$el.appendTo(this.ui.body);

			Syphon.deserialize(this, this.model.toJSON());
			this.ui.title.html("Редактирование проекта");

		},
		onSaveProject: function(event) {

			event.preventDefault();
			
			var data = Syphon.serialize(this);
			this.model.set(data);

			this.model.once('sync', function() {
				console.log("model saved!");
				this.$el.modal("hide");
				this.trigger('form:saved', this.model);
			}, this);

			this.model.once('error', function(errors) {
				console.log("model error!");
				this.trigger('form:error', this.model);
			}, this);

			this.model.save();
		}
	});

	return {
		View: View
		// Region: Region
	}
});