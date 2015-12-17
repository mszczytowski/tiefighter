var socket = io();

var id = window.location.hash.substr(1);

socket.emit('start', {
	"id": id
});

$('#move').on('click', function(e) {
	var data = {
		"id": id,
		"x": $('#x').val(),
		"y": $('#y').val(),
		"fire": false
	}

	socket.emit('pad', data);
});

$('#fire').on('click', function(e) {
	var data = {
		"id": id,
		"x": $('#x').val(),
		"y": $('#y').val(),
		"fire": true
	};

	socket.emit('pad', data);
});

socket.on('message', function (data) {
	console.log(data);
	var ship = data.ships.find(function(item) {
		return item.id === id;
	});
	if(ship === undefined) {
		$('#dposition').html('undefined');
		$('#dvector').html('undefined');
		$('#dfire').html('undefined');
		$('#dhit').html('undefined');
	} else {
		$('#dposition').html(ship.position[0] + ', ' + ship.position[1] + ', ' + ship.position[2]);
		$('#dvector').html(ship.vector[0] + ', ' + ship.vector[1] + ', ' + ship.vector[2]);
		$('#dfire').html(ship.fire);
		$('#dhit').html(ship.hit);
	}

});
