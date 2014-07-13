define('root/tasks/Create', [
  'jquery', 'underscore', 'backbone', 'backbone.marionette',
  'backbone.syphon'
], function($, _, Backbone, Marionette, Syphon) {"use strict";    
  
    var Region = Marionette.Region.extend({
      el: "#create-task-region"
    });
    var region = new Region();

    var CreateView = Marionette.ItemView.extend({
      template: '#create-task-template',
      onRender: function() {

        var modalWindow = $("#myModal");
        var $modalFooter = modalWindow.find('.modal-footer');

        var saveButton = $modalFooter.find('button').eq(1);
        saveButton.on('click', _.bind(this.onTaskSaveClick, this));

        //TODO - нужно пофиксить этот функцинал. Сделать в DRY стиле. Допустим наследуясь от формы
        modalWindow.find('.modal-title').html("Создание задачи");
        modalWindow.find('.modal-body').children().each(function() {
            var formRegionId = _.isString(region.el) ?
                      region.el: "#" + $(region.el).attr("id");

            if (("#" + $(this).attr("id")) != formRegionId) {
                $(this).css('display', 'none');
            } else {
            $(this).css('display', 'block');
          }
        });

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
      Region: region
    }
});