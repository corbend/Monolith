define('root/projects/Create', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'backbone.syphon'
], function($, _, Backbone, Marionette, Syphon) {"use strict";
	
	var Region = Marionette.Region.extend({
		el: '#create-project-region'
	})

	var View = Marionette.ItemView.extend({
		template: '#create-project-template',
		className: 'full-range',
		events: {
			'click .save-button': 'onSaveProject'
		},
		onSaveProject: function(event) {
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

	return {
		View: View,
		Region: new Region()
	}
});