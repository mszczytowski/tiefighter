var socket = io.connect();

//
//var gn = new GyroNorm();
//gn.init().then(function () {
//
//    var xFix = 6;
//    var sensitive = 200;
//    var lastDate = Date.now();
//
//    gn.start(function (data) {
//
//        if (Date.now() - lastDate > sensitive) {
//
//            var sendData = {
//                id: window.location.hash.substr(1)
//            };
//
//            // Process:
//            // data.do.alpha    ( deviceorientation event alpha value )
//            // data.do.beta     ( deviceorientation event beta value )
//            // data.do.gamma    ( deviceorientation event gamma value )
//            // data.do.absolute ( deviceorientation event absolute value )
//
//            // data.dm.x        ( devicemotion event acceleration x value )
//            // data.dm.y        ( devicemotion event acceleration y value )
//            // data.dm.z        ( devicemotion event acceleration z value )
//
//            // data.dm.gx       ( devicemotion event accelerationIncludingGravity x value )
//            // data.dm.gy       ( devicemotion event accelerationIncludingGravity y value )
//            // data.dm.gz       ( devicemotion event accelerationIncludingGravity z value )
//
//            // data.dm.alpha    ( devicemotion event rotationRate alpha value )
//            // data.dm.beta     ( devicemotion event rotationRate beta value )
//            // data.dm.gamma    ( devicemotion event rotationRate gamma value )
//
//
//            $('#xpad').html("x = " + data.dm.gx);
//            $('#ypad').html("y = " + data.dm.x);
//            $('#zpad').html("z = " + data.dm.gz);
//
//            $('#alpha').html("alpha = " + data.do.alpha);
//            $('#gamma').html("gamma = " + data.do.gamma);
//            $('#beta').html("beta = " + data.do.beta);
//
//            console.info("START");
//            console.info("Emit:");
//            console.info(sendData);
//
//            socket.emit('move', data);
//            lastDate = Date.now();
//        }
//
//    });
//}).catch(function (e) {
//    // Catch if the DeviceOrientation or DeviceMotion is not supported by the browser or device
//});


$('#container').on('click', function (e) {
    var data = {
        id: window.location.hash.substr(1)
    };

    socket.emit('pad', data);
});

if (window.DeviceMotionEvent != undefined) {

    var xFix = 6;
    var sensitive = 200;
    var lastDate = Date.now();

    window.ondevicemotion = function (e) {
        var data = {
            id: window.location.hash.substr(1)
        };

        if (Date.now() - lastDate > sensitive) {

            data.x = e.accelerationIncludingGravity.x;
            data.y = e.accelerationIncludingGravity.y;
            data.z = e.accelerationIncludingGravity.z;

            if (e.rotationRate) {
                data.alpha = e.rotationRate.alpha;
                data.beta = e.rotationRate.beta;
                data.gamma = e.rotationRate.gamma;
            }

            $('#xpad').html("x = " + data.x);
            $('#ypad').html("y = " + data.y);
            $('#zpad').html("z = " + data.z);

            $('#alpha').html("alpha = " + data.alpha);
            $('#gamma').html("gamma = " + data.gamma);
            $('#beta').html("beta = " + data.beta);


            console.info("Emit:");
            console.info(data);
            socket.emit('move', data);

            lastDate = Date.now();

        }
    }
}
