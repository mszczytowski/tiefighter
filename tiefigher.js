require('array.prototype.find');

var DIMENSION = 10000;
var SPEED = 0.01; // per second
var INTERVAL = 1000;

var broadcastCallback = null;

var ships = {};
var joysticks = {};
var fires = {};
var hits = {};
var timestamps = {};

function normalizeVector(vector) {
  var a = Math.abs(Math.sqrt((vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2])));
  return [vector[0]/a, vector[1]/a, vector[2]/a];
}

function calculateVector(vector, joystick) {
  vector[0] = vector[0] + joystick[0];
  vector[1] = vector[1] + joystick[1];
  vector[2] = vector[2]
  return normalizeVector(vector);
}

function calculatePosition(position, vector, delta) {
  var s = delta*SPEED/1000.0;
  position[0] = position[0] + (vector[0] * SPEED);
  position[1] = position[1] + (vector[1] * SPEED);
  position[2] = position[2] + (vector[2] * SPEED);
  return position;
}

function calculateRotation(rotation, joystick) {
  return rotation;
}

function calculateHit(hit, position) {
  if(hit) {
    return hit;
  }
  if(position[0] <= -DIMENSION || position[0] >= DIMENSION) {
    return hit;
  }
  if(position[1] <= -DIMENSION || position[1] >= DIMENSION) {
    return hit;
  }
  if(position[2] <= -DIMENSION || position[2] >= DIMENSION) {
    return hit;
  }
  // zderzenie z gwiazdą
  // strzał
  return false;
}

function getRandomVectionItem() {
  return (Math.random()*2)-1;
}

function getRandomPosition() {
  return Math.round((getRandomVectionItem())*10000);
}

function create(id) {
  ships[id] = {
    "id" : id,
    "position": [getRandomPosition(),getRandomPosition(),getRandomPosition()],
    "vector": [getRandomVectionItem(),getRandomVectionItem(),getRandomVectionItem()],
    "rotation": getRandomVectionItem(),
    "fire": false,
    "hit": false
  };
  timestamps[id] = new Date().getTime();
  joysticks[id] = [0.0, 0.0, 0.0];
  fires[id] = false;
  hits[id] = false;
}

function remove(id) {
  delete ships[id];
  delete joysticks[id];
  delete fires[id];
  delete hits[id];
}

function destroy(id) {
  if(ships[id] === undefined) return;
  hits.id = true;
}

function move(id, x, y, z) {
  if(ships[id] === undefined) return;
  joysticks[id] = [x, y, z];
}

function fire(id, fire) {
  if(ships[id] === undefined) return;
  fires[id] = fire;
}

exports.start = function(message) {
  create(message.id);
}

exports.end = function(message) {
  destroy(message.id);
}

exports.pad = function(message) {
  move(message.id, parseFloat(message.x), parseFloat(message.y), parseFloat(message.z) || 0);
  fire(message.id, message.fire);
}

function calculate() {
  Object.keys(ships).forEach(function(key) {
    var ship = ships[key];
    ship.fire = false;
  });

  Object.keys(fires).forEach(function(key) {
    if(fires[key]) {
      ships[key].fire = true;
      fires[key] = false;
    }
  });

  Object.keys(hits).forEach(function(key) {
    if(hits[key] && ships[key]) {
      ships[key].hit = true;
      fires[key] = false;
    }
  });

  Object.keys(ships).forEach(function(key) {
    var ship = ships[key];
    var timestamp = new Date().getTime();
    ship.vector = calculateVector(ship.vector, joysticks[key]);
    ship.position = calculatePosition(ship.position, ship.vector, timestamp - timestamps.key);
    ship.rotation = calculateRotation(ship.rotation, joysticks[key]);
    ship.hit = calculateHit(ship.hit, ship.position);

    timestamps[key] = timestamp;

    if(ship.hit) {
      hits[key] = true;
    }
  });

  var message = {
    "ships": []
  }

  Object.keys(ships).forEach(function(key) {
    message.ships.push(ships[key]);
  });

  broadcastCallback(message);

  Object.keys(hits).forEach(function(key) {
    if(hits[key]) {
      remove(key);
    }
  });
}

exports.broadcast = function(callback) {
  broadcastCallback = callback;
  setInterval(calculate, INTERVAL);
}
