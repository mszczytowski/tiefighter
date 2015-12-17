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

    var oldData = {};
    oldData.x = 0;
    oldData.y = 0;

    window.ondevicemotion = function (e) {

        var data = {
            id: window.location.hash.substr(1)
        };

        if (Date.now() - lastDate > sensitive) {

            var x = e.accelerationIncludingGravity.x;
            var y = e.accelerationIncludingGravity.y;

            $('#xpad').html("x = " + scale(x));
            $('#ypad').html("y = " + scale(y));

            console.info("OLD");
            console.info(oldData.x);
            console.info("NEW +");
            console.info(scale(x));

            data.x = checkMax(scale(x));
            data.y = checkMax(scale(y));

            oldData = data;

            console.info(data);
            socket.emit('pad', data);
            lastDate = Date.now();
        }
    }

    function checkMax(num) {
        if (num > 1) {
            return 1;
        } else if (num < -1) {
            return -1;
        }

        return num;
    }

    function scale(num) {

        var result = parseFloat(num / 10).toFixed(2); //  * 0.15;
        return checkMax(result);
    }


}
