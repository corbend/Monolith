define('root/tasks/TaskUsers', [
  'jquery', 'underscore', 'backbone', 'backbone.marionette',
  'backbone.syphon',
  'root/users/Users'
], function($, _, Backbone, Marionette, Syphon,
	Users
) {"use strict";    
  
	var FormRegion = Marionette.Region.extend({
  		el: "#append-user-region"
    });

	var TaskUserForm = Marionette.ItemView.extend({
		template: '#task-user-form-template',
		className: 'col-md-12 append-user-form',
		onRender: function() {
        	var $modalFooter = $("#myModal").find('.modal-footer');
        	var saveButton = $modalFooter.find('button').eq(1);
        	saveButton.on('click', _.bind(this.onFormSaveClick, this));
      	},
      	onFormSaveClick: function(event) {
      		event.preventDefault();
      		event.stopPropagation();
        	controller.appendUser(this);
      	}
	});

	var Collection = Backbone.Collection.extend({
		model: Users.Model
	});

	var TaskUserItemView = Marionette.ItemView.extend({
		template: '#task-user-item-template',
		tagName: 'li',
		className: 'list-group-item',
		triggers: {
			'click': 'item:select'
		}
	});

	var ListView = Marionette.CompositeView.extend({
		template: "#task-user-list-template", 
		childView: TaskUserItemView,
		childViewContainer: 'ul'
	})

	var Controller = Marionette.Controller.extend({

		showTaskUsers: function(listViewRegion, taskId) {
			//показываем виджет добавления пользователей в задачу
			var scope = this;

			var TaskUsersCollection = Backbone.Collection.extend({
				model: Users.Model,
				url: function() {
					return 'tasks/' + taskId + '/users'
				}
			});

			var collection = new TaskUsersCollection();

			collection.fetch({
				success: function() {
					listViewRegion.show(new ListView({
						collection: collection
					}));
				}
			});

		},
		showAppendForm: function(taskModel, taskCollection) {

			var region = new FormRegion();
			var model = new Backbone.Model();
			var modalWindow = $('#myModal');

			model.set('task', taskModel);

			modalWindow.modal({show: true});

			var form = new TaskUserForm({
				model: model
			});

			modalWindow.find('.modal-title').html("Прикрепление пользователя к задаче");
			modalWindow.find('.modal-body').children().each(function() {
				var formRegionId = _.isString(region.el) ?
							   		region.el: "#" + $(region.el).attr("id");

				if (("#" + $(this).attr("id")) != formRegionId) {
					$(this).css('display', 'none');
				} else {
					$(this).css('display', 'block');
				}
			});

			form.on('show', function() {
				//скроем кнопку добавления

				var region = new Marionette.Region({
					el: this.$el
				});

				Users.Collection.fetch({
					success: function() {
						var listOfUsers = new ListView({
							collection: Users.Collection
						});

						listOfUsers.on('show', function() {
							listOfUsers.$('button').css('display', 'none');
						});

						listOfUsers.on('childview:item:select', function(childView) {
							childView.$el.toggleClass('active');
							// childView.$('input').attr('checked', 'checked');
							var users = model.get('users') || [];
							users.push(childView.model);
							model.set('users', users);
						});

						region.show(listOfUsers);
					}
				})
					

			}, form);

			region.show(form);
		},
		appendUser: function(formView) {

			var users = formView.model.get('users');
			//добавлениe нового пользователя
			var task = formView.model.get('task');
			var usersOnTask = task.get('users');

			usersOnTask = _.union(usersOnTask, _.map(users, function(u) {return u.attributes._id}));
			usersOnTask = usersOnTask.filter(function(v) { return v;});
			// console.log("ADD USERS");
			// console.log(usersOnTask);
			task.set('users', usersOnTask);
			if (task.save()) {
				alert('Пользователи успешно добавлен к задаче.');
				$("#myModal").modal('hide');
			}
		}
	});
	
	var controller = new Controller();

    return {
    	Controller: controller
    }
});