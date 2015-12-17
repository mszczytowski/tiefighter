require('array.prototype.find');

var DIMENSION = 10000;

var broadcastCallback = null;

var data = {
  "ships": []
}

var joysticks = [];

function getById(array, id) {
  return array.find(function(item) { return item.id == id });
}

function getRandomVectionItem() {
  return (Math.random()*2)-1;
}

function getRandomPosition() {
  Math.round((getRandomVectionItem())*10000)
}

function create(id) {
  data.ships.push({
    "id": id,
    "position": [getRandomPosition(),getRandomPosition(),getRandomPosition()],
    "vector": [getRandomVectionItem(),getRandomVectionItem(),getRandomVectionItem()],
    "fire": false,
    "hit": false
  });
  joysticks.push({
    "id": id,
    "x": 0.0,
    "y": 0.0,
  });
}

function move(id, x, y) {
  var ship = getById(joysticks, id);
  if(ship === undefined) return;
  ship.x = x;
  ship.y = y;
}

function fire(id, fire) {
  var ship = getById(data.ships, id);
  if(ship === undefined) return;
  ship.fire = fire;
}

exports.start = function(message) {
  create(message.id);
}

exports.pad = function(message) {
  move(message.id, message.x, message.y);
  fire(message.id, message.fire);
}

function calculate() {
  // do funny stuff here
  broadcastCallback(data);
}

exports.broadcast = function(callback) {
  broadcastCallback = callback;
  setInterval(calculate, 100);
}
