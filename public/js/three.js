var socket = io.connect();

var id = window.location.hash.substr(1);

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var radius = 6371;
var tilt = 0.41;
var rotationSpeed = 0.02;

var cloudsScale = 1.005;
var moonScale = 0.23;

var MARGIN = 0;
var SCREEN_HEIGHT = window.innerHeight - MARGIN * 2;
var SCREEN_WIDTH  = window.innerWidth;

var container, stats;
var camera, controls, scene, sceneCube, renderer;
var geometry, meshPlanet, meshClouds, meshMoon;
var fighters = {};
var dirLight, pointLight, ambientLight;
var fires = [];

var d, dPlanet, dMoon, dMoonVec = new THREE.Vector3();

var clock = new THREE.Clock();

var TIE_SPEED = 1000; //100 punktów na sekunde

var data = {
  ships: [
    {
      id: 1,
      position: [radius * 5, 0, 0],
      vector: [-1, -1 ,0],
      fire: false,
      hit: false,
    },
		{
			id: 3,
			position: [radius * 5, 0, 0],
			vector: [-1, 1 ,0],
			fire: false,
			hit: false,
		}
  ]
}

var tieObject = {};
var tieMaterial = {};

loadObj('models/tie.obj', function() {
	init();
	animate();
	/*console.log(tieObject, tieMaterial);
	var test = new THREE.Mesh(tieObject, tieMaterial);
	test.position.set( -radius * 5, 0, 0 );
	test.scale.set( 300, 300, 300);
	scene.add( test);*/
});

function loadObj(name, callback) {
	var texture = THREE.ImageUtils.loadTexture( "textures/tie.png" );
	var loader = new THREE.OBJLoader( );
	loader.load( name, function ( object ) {

		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = texture;
				tieObject = child.geometry;
				tieMaterial = child.material;
			}
		} );

		//object.position.set( -radius * 5, 0, 0 );
		//object.scale.set( 300, 300, 300);

		//scene.add( object );
		//tieObject = object;
		callback();
	});
}

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 25, SCREEN_WIDTH / SCREEN_HEIGHT, 50, 1e7 );
	camera.position.z = radius * 5;

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.00000025 );

	// controls = new THREE.FlyControls( camera );

	// controls.movementSpeed = 1000;
	// controls.domElement = container;
	// controls.rollSpeed = Math.PI / 24;
	// controls.autoForward = false;
	// controls.dragToLook = false;

	dirLight = new THREE.DirectionalLight( 0xffffff );
	dirLight.position.set( -1, 0, 1 ).normalize();
	scene.add( dirLight );

	var materialNormalMap = new THREE.MeshPhongMaterial( {

		specular: 0x333333,
		shininess: 15,
		map: THREE.ImageUtils.loadTexture( "textures/planets/deathstar.jpg" ),
		normalScale: new THREE.Vector2( 0.85, 0.85 )

	} );

	// planet

	geometry = new THREE.SphereGeometry( radius, 100, 50 );

	meshPlanet = new THREE.Mesh( geometry, materialNormalMap );
	meshPlanet.rotation.y = 0;
	meshPlanet.rotation.z = tilt;
	scene.add( meshPlanet );

	// moon
	var materialMoon = new THREE.MeshPhongMaterial( {

		map: THREE.ImageUtils.loadTexture( "textures/planets/moon_1024.jpg" )

	} );

	meshMoon = new THREE.Mesh( geometry, materialMoon );
	meshMoon.position.set( radius * 5, 0, 0 );
	meshMoon.scale.set( moonScale, moonScale, moonScale );
	scene.add( meshMoon );

	// fighters
	var materialFighter = new THREE.MeshNormalMaterial();
	var fighterGeometry = new THREE.CubeGeometry( 2500, 2500, 2500 )
	for (var i = 0; i < data.ships.length; i++)
	{
		if (data.ships[i].id == id)
		{
			continue;
		}
		fighters[data.ships[i].id] = {};
		fighters[data.ships[i].id].mesh = new THREE.Mesh(tieObject, tieMaterial);
		fighters[data.ships[i].id].mesh.scale.set( 30, 30, 30);
		//fighters[data.ships[i].id].mesh = tieObject.clone();//new THREE.Mesh( tieObject.mesh.clone(), materialFighter );
		fighters[data.ships[i].id].mesh.position.set( data.ships[i].position[0], data.ships[i].position[1], data.ships[i].position[2] );
		fighters[data.ships[i].id].vector = new THREE.Vector3(data.ships[i].vector[0], data.ships[i].vector[1], data.ships[i].vector[2]);
		scene.add( fighters[data.ships[i].id].mesh );
	}

	data.ships.push(
	{
		id: 2,
		position: [-radius * 5, 0, 0],
		vector: [50, 0, -50],
		fire: false,
		hit: false,
	});

	// stars

	var i, r = radius, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];

	for ( i = 0; i < 250; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2 - 1;
		vertex.y = Math.random() * 2 - 1;
		vertex.z = Math.random() * 2 - 1;
		vertex.multiplyScalar( r );

		starsGeometry[ 0 ].vertices.push( vertex );

	}

	for ( i = 0; i < 1500; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2 - 1;
		vertex.y = Math.random() * 2 - 1;
		vertex.z = Math.random() * 2 - 1;
		vertex.multiplyScalar( r );

		starsGeometry[ 1 ].vertices.push( vertex );

	}

	var stars;
	var starsMaterials = [
		new THREE.PointsMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x555555, size: 1, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x333333, size: 2, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x3a3a3a, size: 1, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
	];

	for ( i = 10; i < 30; i ++ ) {

		stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

		stars.rotation.x = Math.random() * 6;
		stars.rotation.y = Math.random() * 6;
		stars.rotation.z = Math.random() * 6;

		s = i * 10;
		stars.scale.set( s, s, s );

		stars.matrixAutoUpdate = false;
		stars.updateMatrix();

		scene.add( stars );

	}

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	renderer.sortObjects = false;

	renderer.autoClear = false;

	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

	// postprocessing

	var renderModel = new THREE.RenderPass( scene, camera );
	var effectFilm = new THREE.FilmPass( 0.35, 0.75, 2048, false );

	effectFilm.renderToScreen = true;

	composer = new THREE.EffectComposer( renderer );

	composer.addPass( renderModel );
	composer.addPass( effectFilm );

}

function onWindowResize( event ) {

	SCREEN_HEIGHT = window.innerHeight;
	SCREEN_WIDTH  = window.innerWidth;

	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

	composer.reset();

}

function animate() {
	requestAnimationFrame( animate );
	update();
	render();
}

var lastCalledTime;

function update() {
	if(!lastCalledTime) {
		lastCalledTime = Date.now();
		return;
	}

	delta = (new Date().getTime() - lastCalledTime)/1000;
	lastCalledTime = Date.now();

	var deltaSpeed = TIE_SPEED*delta;

for (var i = 0; i < fires.length; i++) {
	var line = lines.pop();
	if (line) {
		scene.remove(line);
	}
}

	for(var key in fighters) {
		var fighter = fighters[key];
		var x = fighter.mesh.position.x + fighter.vector.x*deltaSpeed;
		var y = fighter.mesh.position.y + fighter.vector.y*deltaSpeed;
		var z = fighter.mesh.position.z + fighter.vector.z*deltaSpeed;
		fighter.mesh.position.set(x, y, z);
	};

	if (fighters.hasOwnProperty(id)) {
		camera.position.x = fighters[id].mesh.position.x;
		camera.position.y = fighters[id].mesh.position.y;
		camera.position.z = fighters[id].mesh.position.z;
		camera.lookAt(new THREE.Vector3(fighters[id].mesh.position.x + (fighters[id].vector.x)*delta, fighters[id].mesh.position.y + (fighters[id].vector.y*delta), fighters[id].mesh.position.z + (fighters[id].vector.z*delta)));

if (fighters[id].fire) {
	var material = new THREE.LineBasicMaterial({
		color: 0xff0000
	});
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(fighters[id].mesh.position.x + 20, fighters[id].mesh.position.y, fighters[id].mesh.position.z));
	geometry.vertices.push(new THREE.Vector3(fighters[id].mesh.position.x + (fighters[id].vector.x)*10000, fighters[id].mesh.position.y + (fighters[id].vector.y)*10000, fighters[id].mesh.position.z + (fighters[id].vector.z)*10000));
	var line = new THREE.Line(geometry, material);
	fires.push(line);
		scene.add(line);
	}
	}
}

function render() {
	// rotate the planet and clouds

	var delta = clock.getDelta();

	meshPlanet.rotation.y += rotationSpeed * delta;

	// slow down as we approach the surface

	dPlanet = camera.position.length();

	dMoonVec.subVectors( camera.position, meshMoon.position );
	dMoon = dMoonVec.length();

	if ( dMoon < dPlanet ) {

		d = ( dMoon - radius * moonScale * 1.01 );

	} else {

		d = ( dPlanet - radius * 1.01 );

	}

	// controls.movementSpeed = 0.33 * d;
	// controls.update( delta );

	renderer.clear();
	composer.render( delta );

}

socket.emit('start', {
	"id": id
});

function playFire() {
	$("#laser").trigger("play");
}

socket.on('message', function (data) {
	var ships = data.ships;
	for(var i = 0; i < ships.length; i++) {
		var shipId = ships[i].id;
		if (!fighters.hasOwnProperty(shipId))
		{
			var materialFighter = new THREE.MeshNormalMaterial();
			fighters[shipId] = {};
			fighters[shipId].mesh = new THREE.Mesh(tieObject, tieMaterial);
			fighters[shipId].mesh.position.set( -radius * 4, 0, 0 );
			fighters[shipId].mesh.scale.set( 30, 30, 30);
			fighters[shipId].vector = new THREE.Vector3(0, 0, 0);
			if(id != shipId) {
					 scene.add(fighters[shipId].mesh);
			} else {
				if(fighters[shipId].fire) {
					playFire();
				}
			}
		}
		fighters[shipId].mesh.position.set(ships[i].position[0], ships[i].position[1], ships[i].position[2] );
		fighters[shipId].vector.set(ships[i].vector[0], ships[i].vector[1], ships[i].vector[2]);
		fighters[shipId].fire = ships[i].fire;
		fighters[shipId].hit = ships[i].hit;

    if(ships[i].hit) {
      // buum
      scene.remove(fighters[shipId].mesh);
      delete fighters[shipId];
    }

		//TODO: removing
	}
});
