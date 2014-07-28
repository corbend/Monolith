define('root/welcome/Application', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'root/welcome/Features'
], function($, _, Backbone, Marionette,
	Features
) {"use strict";
	
	var Monolith = Monolith || {};

	Monolith.Main = new Marionette.Application();
	Monolith.Main.addRegions({
		mainContent: '#mainContent',
		leftMenu: '#leftMenu',
		rightMenu: '#rightMenu'
	});

	Monolith.Main.addInitializer(function() {
		Monolith.Features = Features;
	});

	Monolith.Main.addInitializer(function() {

		var Router = Marionette.AppRouter.extend({
			'*path': 'showStartScreen' 
		});

		this.Router = new Router({
			controller: Monolith.Main.API
		})
	});

	Monolith.Main.API = {
		showStartScreen: function() {
			Monolith.Main.mainContent.show(Features.Controller.showFeatures());
		}
	}

	Monolith.Main.on('start', function() {
		Backbone.history.start();
		this.API.showStartScreen();
		// Cufon.replace('.symbolic',  { fontFamily: 'OddBats', hover: true });
		Cufon.replace('.symbolic',  { fontFamily: 'Lombax', hover: true });
	});

	window.Monolith = Monolith;

	return {
		Application: Monolith.Main
	}
});