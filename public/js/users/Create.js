define('root/users/Create', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'backbone.syphon'
], function($, _, Backbone, Marionette, Syphon) {"use strict";
	
	var Region = Marionette.Region.extend({
		el: '#create-user-region'
	})

	var View = Marionette.ItemView.extend({
		template: '#create-user-template'
	});

	return {
		Region: new Region(),
		View: View
	}
});