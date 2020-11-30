var express = require('express');
var Server = require('http').Server;
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ip = require("ip");
var chalk = require('chalk');
var apiRouter = require('./routes/api');
var shutDown = require('./types/ServerUtils').shutDown;

var app = express();

// Setup http server
var server = new Server(app);
server.listen(3001);
process.on('SIGTERM', () => shutDown(server, 8000));
process.on('SIGINT',  () => shutDown(server, 8000));

// Setup the express app
var displayLogs = true; // TODO: only when running a developer build
if (displayLogs) {
  app.use(logger('dev'));
}
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Setup routing: if the request url starts with /api, send it to the API router
app.use('/api', apiRouter);

// Setup routing: direct all other requests to the React app
app.use(express.static(path.join(__dirname, '/../client/build')));
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/../client/build', 'index.html'));
});

// Print welcome message to users
console.log('Join the game at ' + chalk.bold('http://' + ip.address() + ":3001"));
console.log('For help joining, see the troublshooting guide here: https://github.com/jrgermain/cards-against-covid/wiki');

module.exports = app;