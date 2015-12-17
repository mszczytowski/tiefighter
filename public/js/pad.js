var socket = io.connect();

$('#container').on('click', function(e) {
	var data = {
		id: window.location.hash.substr(1)
	};

	socket.emit('fire', data);
});

if (window.DeviceMotionEvent != undefined) {
	window.ondevicemotion = function(e) {
		var data = {
			id: window.location.hash.substr(1)
		};

		data.x = e.accelerationIncludingGravity.x;
		data.y = e.accelerationIncludingGravity.y;
		data.z = e.accelerationIncludingGravity.z;

		if ( e.rotationRate ) {
			data.alpha = e.rotationRate.alpha;
			data.beta = e.rotationRate.beta;
			data.gamma = e.rotationRate.gamma;
		}

		socket.emit('move', data);
	}
}
