
var PORT = process.env.PORT || 8080;
var http = require('http');
var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var db = require('./db');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var startup = require("./startup");
var routing = require("./routing");
var app = express();

app.configure(function() {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({secret: '999'}));
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

db.init();

routing.route(app);

app.listen(PORT, function() {
	console.log("Server is listening on port " + PORT);
});