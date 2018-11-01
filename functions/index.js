const functions = require('firebase-functions');
const express = require('express');
const routes = require('./api/routes/index.route');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const databaseController = require('./api/firebase/firebase.controller');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());

databaseController.initDB();
app.use(routes);
app.use('/app', express.static(__dirname + '/../client/app'));
app.use('/css', express.static(__dirname + '/../client/css'));
app.use('/script', express.static(__dirname + '/../client/js'));

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.app = functions.https.onRequest(app);
