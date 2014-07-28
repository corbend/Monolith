define('root/service/Selection', [
	'jquery', 'underscore', 'backbone'
], function($, _, Backbone) {

	var SelectionModel = Backbone.Model.extend({
		defaults: {
			activator: null,
			target: null,
			context: null
		}
	});

	var MultiSelection = Backbone.Collection.extend({
		model: SelectionModel
	});

	return {
		Single: new SelectionModel(),
		Task: new SelectionModel(),
		Multi: new MultiSelection()
	}
});