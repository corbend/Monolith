define('root/projects/views/CreateSuccess', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette'
], function($, _, Backbone, Marionette
	
) {"use strict";
	//вид отображаемый после успешного создания проекта
	
	return Marionette.ItemView.extend({

		template: "#success-project-view",
		options: {
			title: 'Проект успешно создан.'
		},
		triggers: {
			'click .recreate-new': 'create:repeat'
		},
		templateHelpers: function() {
			var view = this;
			return {
				title: function() {
					return view.options.title;
				}
			}
		}
	})
});