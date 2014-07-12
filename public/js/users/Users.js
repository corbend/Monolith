define('root/users/Users', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'root/users/Create'
], function($, _, Backbone, Marionette, 
	Create
) {"use strict";
		
	var UserItem = Marionette.ItemView.extend({
		template: '#user-item-template',
		tagName: 'li',
		className: 'list-group-item',
		templateHelpers: {
			'datePrettify': function() {
				return (new Date(this.joined)).valueOf();
			}
		}
	});

	var UserList = Marionette.CollectionView.extend({
		childView: UserItem,
		tagName: 'ul',
		className: 'list-group'
	});
		
	var User = Backbone.Model.extend({
		urlRoot: 'users',
		defaults: {
			name: '',
			joined: ''
		}
	});	

	var Users = Backbone.Collection.extend({
		model: User,
		url: 'users'
	})

	var users = new Users();

	var Controller = Marionette.Controller.extend({
		showUserList: function(region) {
			users.fetch({
				success: function() {
					region.show(new UserList({
						collection: users
					}));
				}
			});
		}
	});

	return {
		Controller: Controller
	}
});