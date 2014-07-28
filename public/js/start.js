requirejs.config({
	baseUrl: 'lib',
	paths: {
		'root'		: '../js',
		'project'	: '../js',
		'bootstrap' : '../vendor/bootstrap/js/bootstrap',
		'epiceditor': 'epiceditor'
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
		},
		'epiceditor': {
			exports: 'EpicEditor'
		}
	}
});

requirejs(['bootstrap',
	'root/welcome/Application'], function(bs, API) {

	API.Application.start();

	console.log("init done!");
});