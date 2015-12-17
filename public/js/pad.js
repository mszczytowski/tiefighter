var socket = io.connect();


$('#container').on('click', function (e) {

    var data = {
        id: window.location.hash.substr(1)
    };

    data.fire = true;
    console.info(data);
    socket.emit('pad', data);
});


if (window.DeviceMotionEvent != undefined) {

    var sensitive = 300;
    var lastDate = Date.now();

    window.ondevicemotion = function (e) {

        var data = {
            id: window.location.hash.substr(1)
        };

        if (Date.now() - lastDate > sensitive) {

            var x = e.accelerationIncludingGravity.x;
            var y = e.accelerationIncludingGravity.y;

            $('#xpad').html("x = " + scale(x));
            $('#ypad').html("y = " + scale(y));

            data.x = scale(x);
            data.y = scale(y);

            console.info(data);
            socket.emit('pad', data);
            lastDate = Date.now();
        }
    }

    function scale(num) {
        return parseFloat(num / 10).toFixed(2)
    }


}

