var socketIo = require('socket.io');
var http     = require('http');
var express  = require('express');
var tiefigher  = require('./tiefigher');
var number   = 1;

var PORT = 3000;

var app = express();

app.get('/', function (req, res) {
  res.redirect('/ship#' + number++);
});

app.get('/ship', function (req, res) {
  res.sendFile(__dirname + '/views/ship.html');
});

app.get('/pad', function (req, res) {
  res.sendFile(__dirname + '/views/pad.html');
});

app.use(express.static(__dirname + '/public'));

// Create HTTP server
server = http.createServer(app);

// Create Socket.io server
var io = socketIo({
  // Optional Socket.io options
});

// Start the socket.io server
io.listen(server);

// Upon connection, start a periodic task that emits (every 1s) the current timestamp
io.on('connection', function (socket) {

  socket.on('connect', function (data) {
    tiefigher.connect(data);
  });

  socket.on('pad', function (data) {
    tiefigher.pad(data);
	});

  tiefigher.broadcast(function(data) {
    socket.broadcast.emit('message', data);
  });
});

server.listen(PORT);

console.log('Server listening on port %d', PORT);
