define('root/base/ConfirmWindow', [

	'jquery', 'underscore', 'backbone', 'backbone.marionette'

], function($, _, Backbone, Marionette) {

	var View = Marionette.ItemView.extend({

		template: '#confirm-dialog-template',
		options: {
			title: '',
			text: '',
			onOK: null,
			onClose: null
		},
		onRender: function() {

			this.$el.modal({
				show: true
			})
			
		},
		templateHelpers: function() {
			var scope = this;
			return {
				title: function() {
					return scope.options.title
				},
				text: function() {
					return scope.options.text
				}
			}
		},
		events: {
			'click .save-button': 'onConfirm',
			'click .close-button': 'onClose'
		},
		onConfirm: function() {

			this.options.onOK.apply(this, arguments);

			this.$el.modal('hide');
		},
		onClose: function() {

			if (this.options.onClose) {
				this.options.onClose.apply(this, arguments);
			}

			this.$el.modal('hide');
		}
	});

	return View;
});