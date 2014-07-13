define('root/tasks/Create', [
  'jquery', 'underscore', 'backbone', 'backbone.marionette',
  'backbone.syphon'
], function($, _, Backbone, Marionette, Syphon) {"use strict";    
  
  var Region = Marionette.Region.extend({
      el: "#create-task-region"
    });

    var CreateView = Marionette.ItemView.extend({
      template: '#create-task-template',
      onRender: function() {
        var $modalFooter = $("#myModal").find('.modal-footer');

        var saveButton = $modalFooter.find('button').eq(1);
        saveButton.on('click', _.bind(this.onTaskSaveClick, this));
      },
      onTaskSaveClick: function(event) {
        event.preventDefault();

        var data = Syphon.serialize(this);

        this.model.once('sync', function() {

          this.trigger('form:saved', this.model);
          $("#myModal").modal('hide');

        }, this);

        this.model.once('error', function(errors) {
          this.trigger('form:error', this.model, errors);
        }, this);

        this.model.set(data);

        this.trigger('form:before:save', this.model);
        this.model.save();

      }
    });

    return {
      View: CreateView,
      Region: new Region()
    }
});