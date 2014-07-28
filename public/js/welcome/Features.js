define('root/welcome/Features', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'root/projects/Projects'
], function($, _, Backbone, Marionette, 
	Projects
) {"use strict";
		
	var FeatureModel = Backbone.Model.extend({
		defaults: {
			name: '',
			description: ''
		}
	});

	var Features = Backbone.Collection.extend({
		model: FeatureModel
	});

	var features = new Features();

	features.reset([
		{name: 'Highmark', title: 'Электронная коммерция',
		 description: 'Разработка интернет-магазинов'},
		{name: 'Smartstore', title: 'Товарооборот', 
		 description: 'ERP система управления торговлей'},
		{name: 'Sentinel', title: 'Управление проектами', 
		 description: 'Система управления проектами'},
		{name: 'NewVision', title: 'Корпоративное обучение',
		 description: 'Система обучения сотрудников и повышения квалификации'}
	]);

	var FeatureItem = Marionette.ItemView.extend({
		template: '#feature-template',
		tagName: 'li',
		events: {
			'hover .panel': 'highlightFeature'
		},
		highlightFeature: function() {
			this.$el.toggleClass('green-light');
		}
	});

	var FeatureGrid = Marionette.CollectionView.extend({
		tagName: 'ul',
		className: 'feature-list feature-grid list-group',
		childView: FeatureItem
	});

	var FeatureList = Marionette.CollectionView.extend({
		tagName: 'ul',
		className: 'feature-list-plain list-group',
		childView: FeatureItem
	});

	var Controller = Marionette.Controller.extend({
		showFeatures: function() {
			var grid = new FeatureGrid({
				collection: features
			});

			return grid;
		}
	})

	return {
		FeatureGrid: FeatureGrid,
		FeatureList: FeatureList,
		Controller: new Controller()
	}
});