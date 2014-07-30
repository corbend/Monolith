
var openShiftPort = process.env.OPENSHIFT_NODEJS_PORT;
var openShiftHost = process.env.OPENSHIFT_NODEJS_IP;
var PORT = openShiftPort || process.env.PORT || 8080;
var HOST = openShiftHost || 'localhost';

var http = require('http');
var path = require('path');
var express = require('express');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var db = require('./db');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var MongoStore = require('connect-mongo')(express);

var startup = require("./startup");
var routing = require("./routing");
var auth = require("./auth/routing");
var authSetup = require("./auth/middleware");
var comments = require('./comments/routing');
var app = express();

var config;

db.init(config, function(err, config) {
	app.configure(function() {

		var dbConfig = db.getConnectionConfig(config);

		app.set('port', config.get("port") || 8080);
    	app.set('views', path.join(__dirname, 'views'));
    	app.set('view engine', 'jade');

		app.use(express.bodyParser());
		app.use(express.methodOverride());
		//TODO - дергать из конфига, настройки сессии
		app.use(express.session({
			store: new MongoStore({
				mongoose_connection: mongoose.connection
			}),
			secret: '999'}));
		app.use(express.static(path.join(__dirname, 'public')));
		app.use(express.static(path.join(__dirname, config.get('mediaDir'))));
		app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
		app.use(passport.initialize());
		app.use(passport.session());
		app.use(flash());
		app.use(app.router);
	});

	authSetup.init(app);
	auth.route(app);
	routing.route(app);
	comments.route(app);
	
	var server = http.Server(app);

	server.listen(PORT, HOST);
});

