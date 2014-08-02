define('root/base/ViewVariator', [

	'jquery', 'underscore', 'backbone', 'backbone.marionette'

], function($, _, Backbone, Marionette) {


	return Marionette.ItemView.extend({

		template: '#view-variator-template',

		options: {
			variants: null,
			allVariants: ['list', 'grid', 'table'],

			controller: null,
			switchBindings: {
				'list': 'showList',
				'grid': 'showGrid',
				'table': 'showTable'
			}
		},
		ui: {
			listButton: '.list-button',
			gridButton: '.grid-button',
			tableButton: '.table-button'
		},
		events: {
			'click .list-button': 'onListClick',
			'click .grid-button': 'onGridClick',
			'click .table-button': 'onTableClick'
		},
		templateHelpers: function() {

			return {
				listOn: _.indexOf(this.options.variants, 'list') != -1,
				gridOn: _.indexOf(this.options.variants, 'grid') != -1,
				tableOn: _.indexOf(this.options.variants, 'table') != -1
			}

		},
		_checkAndInvoke: function(methodName) {

			var controller = this.options.controller;

			if (controller && _.has(controller, methodName)) {
					
				controller[methodName].call(controller);
			}
		},
		onListClick: function() {

			var listShowMethodName = this.options.switchBindings['list'];
			this._checkAndInvoke(listShowMethodName);
		},
		onGridClick: function() {

			var gridShowMethodName = this.options.switchBindings['grid'];
			this._checkAndInvoke(gridShowMethodName);
		},
		onTableClick: function() {

			var tableShowMethodName = this.options.switchBindings['grid'];
			this._checkAndInvoke(tableShowMethodName);
		}
	})

});