define('root/users/Create', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'backbone.syphon'
], function($, _, Backbone, Marionette, Syphon) {"use strict";
	
	var Region = Marionette.Region.extend({
		el: '#create-user-region'
	})

	var userGroups = ['Разработчик', 'Администратор', 'Аналитик'];

	var View = Marionette.ItemView.extend({
		template: '#create-user-template',
		onRender: function() {
        	var $modalFooter = $("#myModal").find('.modal-footer');

        	var saveButton = $modalFooter.find('button').eq(1);
        	saveButton.on('click', _.bind(this.onUserSaveClick, this));
      	},
      	onUserSaveClick: function(event) {
      		event.preventDefault();
      		event.stopPropagation();

        	var data = Syphon.serialize(this);

        	if (data.password != data.passwordRepeat) {
        		alert("Пароли должны совпадать");
        		return;
        	}

	        this.model.once('sync', function() {

	        	this.trigger('form:saved', this.model);
	          	$("#myModal").modal('hide');

	        }, this);

	        this.model.once('error', function(errors) {
	          	this.trigger('form:error', this.model, errors);
	        }, this);

	        data.groupId = _.indexOf(userGroups, data.groupId);

	        if (data.groupId == -1) {
	        	data.groupId = 0;
	        }

	        this.model.set(data);

	        if (!this.model.save()) {
	        	alert("Ошибка сохранения!");
	        }
      	}
	});

	return {
		Region: new Region(),
		View: View
	}
});