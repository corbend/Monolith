define('root/comments/Create', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette', 'backbone.syphon',
	'root/users/Users'
], function($, _, Backbone, Marionette, Syphon,
	Users
) {"use strict";
		
	var Region = Marionette.Region.extend({
		el: '#comment-create-region'
	});

	var CreateForm = Marionette.ItemView.extend({
		template: '#create-comment-template',
		triggers: {
			'click .save-button': 'form:save'
		}
	});

	var Controller = Marionette.Controller.extend({
		showCreateForm: function(region, model) {
			var region = region || new Region();

			//TODO - поправить для текущего пользователя
			var admin = Users.Collection.at(0);

			model.set('userId', admin.id);

			var view = new CreateForm({
				model: model
			});

			region.show(view);

			view.on('form:save', function() {
				var data = Syphon.serialize(this);
				model.set(data);

				if (model.save()) {
					// alert('Комментарий добавлен!')
				}
			});

		}
	})

	return {
		Controller: new Controller(),
		View: CreateForm,
		Region: Region
	}
});