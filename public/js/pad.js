var socket = io.connect();

var oldData = {};
oldData.x;
oldData.y;

$('body').on('touchstart', function (e) {
    var data = {
        id: window.location.hash.substr(1)
    };
    data.fire = true;
    data.x = oldData.x;
    data.y = oldData.y;
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

            //console.info("OLD");
            //console.info(oldData.x);
            //console.info("NEW +");
            //console.info(scale(x));

            data.x = checkMax(scale(x));
            data.y = checkMax(scale(y));
            data.fire = false;

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
