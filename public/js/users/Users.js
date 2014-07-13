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
			joined: '',
			password: '',
			fullname: '',
			groupId: '' //права
		}
	});	

	var Users = Backbone.Collection.extend({
		model: User,
		url: 'users'
	})

	var users = new Users();

	var Toolbar = Marionette.ItemView.extend({
		template: '#user-toolbar-template',
		tagName: 'div',
		className: 'btn-group btn-group-vertical',
		events: {
			'click .btn-new': 'onCreateUserClick'
		},
		onCreateUserClick: function() {
				
			var formRegionId = '';
			var modalWindow = $('#myModal');

			modalWindow.modal({show: true});
			modalWindow.find('.modal-title').html("Создание пользователя");
			modalWindow.find('.modal-body').children().each(function() {

				formRegionId = _.isString(Create.Region.el) ?
							   Create.Region.el: "#" + $(Create.Region.el).attr("id");

				if (("#" + $(this).attr("id")) != formRegionId) {
					$(this).css('display', 'none');
				} else {
					$(this).css('display', 'block');
				}
			});

			var createView = new Create.View({
				model: new User()
			});

			Create.Region.show(createView);
		}
	})

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
		Controller: Controller,
		Toolbar: Toolbar,
		Model: User,
		Collection: users
	}
});