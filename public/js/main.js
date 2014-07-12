requirejs.config({
	baseUrl: 'lib',
	paths: {
		'root'		: '../js',
		'project'	: '../js',
		'bootstrap' : '../vendor/bootstrap/js/bootstrap'
	},
	shim: {
		'jquery': {
			exports: 'JQuery'
		},
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},
		'backbone.marionette': {
			deps: ['jquery', 'underscore', 'backbone'],
			exports: 'Backbone.Marionette'
		},
		'bootstrap': {
			deps: ['jquery'],
			exports: 'bootstrap'
		}
	}
});

requirejs(['bootstrap',
	'root/MainApp'], function(bs, App) {

	App.start();

	console.log("init done!");
});