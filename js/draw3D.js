
var yAxisCenter;
var xAxisCenter;
var center;
var xAxisRight
var yAxisTop;

var myPath;
var firstPath;
var thirdPath;
var fourthPath;

var buttonRect;
var gridRect;

var scene, camera, renderer, controls;

var init = function() {
	//The main path
	myPath = new paper.Path();
	myPath.strokeColor = 'black';

	//init render button
	var buttonPosition = new paper.Point(10,10);
	var buttonSize = new paper.Size(10, 10);
	var button = new paper.Path.Rectangle(buttonPosition, buttonSize);
	button.strokeColor = 'black';
	buttonRect = new paper.Rectangle(buttonPosition, buttonSize);

	//init simple grid
	center = new paper.Point(300,300);
	yAxisCenter = new paper.Point(300,200);
	yAxisTop = new paper.Point(300, 100);
	xAxisCenter = new paper.Point(400, 300);
	xAxisRight = new paper.Point(500, 300);

	var yAxis = new paper.Path();
	var xAxis = new paper.Path();

	yAxis.add(yAxisTop);
	yAxis.add(center);

	xAxis.add(xAxisRight);
	xAxis.add(center);

	yAxis.strokeColor = 'black';
	xAxis.strokeColor = 'black';

	gridRect = new paper.Rectangle(yAxisTop, new paper.Size(200, 200));

	//add starting point to myPath
	myPath.add(yAxisCenter);

	//Add mirroring paths
	firstPath = new paper.Path();
	thirdPath = new paper.Path();
	fourthPath = new paper.Path();

	firstPath.add(yAxisCenter);
	thirdPath.add(new paper.Point(300,400));
	fourthPath.add(new paper.Point(300, 400));

	firstPath.strokeColor = 'black';
	thirdPath.strokeColor = 'black';
	fourthPath.strokeColor = 'black';
	paper.view.draw();

	initThree();
	render();

	function animate() {
		requestAnimationFrame(animate);
		//renderer.render(scene, camera);
		controls.update();
	}

	//Init three.js scene
	function initThree() {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, 500/500, 0.1, 1000 ) //Scene size absolute(500 500)
		camera.position.z = 100;
		renderer = new THREE.WebGLRenderer({ alpha: true });
		renderer.setSize(500,500);
		renderer.setClearColor(0x333F47, 1);

	 	light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 1, 1, 1 );
		scene.add( light );

		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( -1, -1, -1 );
		scene.add( light );

		light = new THREE.AmbientLight( 0x222222 );
		scene.add( light );

		controls = new THREE.TrackballControls( camera );
		controls.addEventListener( 'change', render );

		document.body.appendChild( renderer.domElement );

		animate();
	}
	function render() {
		renderer.render(scene, camera);
	};
}

var mirrorPath = function(point) {
	//mirror the point in the first, third and fourth qadrant
	var firstPoint = new paper.Point();
	firstPoint.x = yAxisCenter.x - (point.x - yAxisCenter.x);
	firstPoint.y = xAxisCenter.y + (point.y - xAxisCenter.y);	
	firstPath.add(firstPoint);

	var thirdPoint = new paper.Point();
	thirdPoint.x = yAxisCenter.x - (point.x - yAxisCenter.x);
	thirdPoint.y = xAxisCenter.y  + (xAxisCenter.y - point.y);
	thirdPath.add(thirdPoint);

	var fourthPoint = new paper.Point();
	fourthPoint.x = point.x;
	fourthPoint.y = thirdPoint.y;
	fourthPath.add(fourthPoint);
}

var makeShape = function(segments) {
	//shape should be on the form of

	var shapePts = [];

	for(var i = 0; i < segments.length; i++) {
		var vector = new THREE.Vector2 ( segments[i].point.x, segments[i].point.y );
		shapePts.push(vector);
	}

	for( var i = 0; i < shapePts.length; i ++ ) shapePts[ i ].multiplyScalar( 0.25 );

	var shape = new THREE.Shape( shapePts);

	var extrudeSettings = { amount: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

	addShape( shape,  extrudeSettings);

}

var addShape = function( shape, extrudeSettings, color) {

	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	geometry.center();

	var material = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
	var group = new THREE.Object3D();
	var shape = new THREE.Mesh( geometry, material);
	var shape2 = new THREE.Mesh( geometry, material);
	var shape3 = new THREE.Mesh( geometry, material);
	var shape4 = new THREE.Mesh( geometry, material);
	var shape5 = new THREE.Mesh( geometry, material);
	var shape6 = new THREE.Mesh( geometry, material);
	var shape7 = new THREE.Mesh( geometry, material);
	shape2.rotation.y += (Math.PI/2);
	shape3.rotation.x += (Math.PI/2);
	shape4.rotation.y += (Math.PI/4);
	shape5.rotation.x += (Math.PI/4);
	shape6.rotation.y += (Math.PI *(3/4));
	shape7.rotation.x += (Math.PI * (3/4));
	group.add(shape7);
	group.add(shape6);
	group.add(shape5);
	group.add(shape4);
	group.add( shape3 );
	group.add( shape2);
	group.add( shape );
	scene.add(group);
	renderer.render(scene, camera);
}

window.onload = function() {
	var paperCanvas = document.getElementById('paperCanvas');
	paperCanvas.height = 500;
	paperCanvas.width = 500;
	paper.setup('paperCanvas');
	
	init();

	var tool = new paper.Tool();

	tool.onMouseDown = function onMouseDown(event) {
		// Add a segment to the path at the position of the mouse:
		if(event.point.isInside(buttonRect)){
			console.log("button pressed");
			myPath.add(xAxisCenter);
			mirrorPath(xAxisCenter);

			fourthPath.reverse()
			firstPath.reverse()

			var newPath = new paper.Path(myPath.segments);
			newPath.addSegments(fourthPath.segments.slice(1));
			newPath.addSegments(thirdPath.segments.slice(1));
			newPath.addSegments(firstPath.segments.slice(1));
			newPath.closed = true;

			newPath.strokeColor = 'red';

			makeShape(newPath.segments);

		}
		else if(event.point.isInside(gridRect)) {
			myPath.add(event.point);
			mirrorPath(event.point);
		}
		paper.view.draw();
	}
}