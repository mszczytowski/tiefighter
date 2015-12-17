require('array.prototype.find');

var DIMENSION = 20000;
var DEATH = 6371;
var DEATH_2 = DEATH * 2;
var SPEED = 1000;
var INTERVAL = 100;
var MAXTILTCHANGE = 0.002;

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
  var tau = Math.acos(vector[2]);
  var fi = Math.atan(vector[1]/vector[0]);
  tau += MAXTILTCHANGE * joystick[1];
  fi += MAXTILTCHANGE * joystick[0] * -1;
  vector[0] = Math.sin(tau) * Math.cos(fi);
  vector[1] = Math.sin(tau) * Math.sin(fi);
  vector[2] = Math.cos(tau);
  return normalizeVector(vector);
}

function calculatePosition(position, vector, delta) {
  var s = delta*SPEED/1000.0;
  position[0] = position[0] + (vector[0] * s);
  position[1] = position[1] + (vector[1] * s);
  position[2] = position[2] + (vector[2] * s);
  return position;
}

function calculateRotation(rotation, joystick) {
  return rotation;
}

function calculateHit(hit, position) {
  if(hit) {
    return true;
  }
  if(position[0] <= -DIMENSION || position[0] >= DIMENSION) {
    return true;
  }
  if(position[1] <= -DIMENSION || position[1] >= DIMENSION) {
    return true;
  }
  if(position[2] <= -DIMENSION || position[2] >= DIMENSION) {
    return true;
  }
  if(position[0] <= DEATH && position[0] >= -1*DEATH
    && position[1] <= DEATH && position[1] >= -1*DEATH
    && position[2] <= DEATH && position[2] >= -1*DEATH
  ) {
    return true;
  }
  // strzał
  return false;
}

function getRandomVectionItem() {
  return (Math.random()*2)-1;
}

function getRandomPosition() {
  var p = Math.round((getRandomVectionItem())*(DIMENSION-DEATH_2));
  if(p > 0 && p < DEATH_2) {
    p += DEATH_2;
  } else if(p < 0 && p > -DEATH_2) {
    p -= DEATH_2;
  }
  return p;
}

function create(id, rand) {
  var position = [getRandomPosition(),getRandomPosition(),getRandomPosition()];
  var vector = normalizeVector([position[0]*-1, position[1]*-1, position[2]*-1]);

  if(rand) {
    vector = normalizeVector([getRandomVectionItem(), getRandomVectionItem(), getRandomVectionItem()]);
  }

  if(ships[id]) {
    ships[id].position = position;
    ships[id].vector = vector;
    return;
  }
  ships[id] = {
    "id" : id,
    "position": position,
    "vector": vector,
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
  create(message.id, false);

  for(i = 0; i < 1000; i++) {
    create(message.id + '_' + i, true);
  }

}

exports.end = function(message) {
  destroy(message.id);
}

exports.pad = function(message) {
  fire(message.id, message.fire);
  move(message.id, parseFloat(message.x), parseFloat(message.y), parseFloat(message.z) || 0);
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
    ship.position = calculatePosition(ship.position, ship.vector, timestamp - timestamps[key]);
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
