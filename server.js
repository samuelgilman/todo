(function () {
  var App = this;
  initLog(App);
  initDb(App);
  initModel(App);
  initController(App);
  initViews(App);
  initRouter(App);
  initServer(App);
}());

function initLog(App) {
  App.Log = require('./app/log.js');
}

function initDb(App) {
  App.Db = require('./app/db.js');
}

function initModel(App) {
  App.Model = require('./app/model.js');
}

function initController(App) {
  App.Controller = require('./app/controller.js');
}

function initViews(App) {
  App.Views = require('./app/views');
}

function initRouter(App) {
  App.Router = require('./app/router.js');
}

function initServer(App) {
  var http = require('http');
  var port = (process.env.PORT || 3000);
  var host = (process.env.HOST || '127.0.0.1');
  var server = http.createServer(Router);
  server.listen(port, host);
  console.log('server on', [port, host].join(':'));
}
