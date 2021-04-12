let scene, camera, renderer, group, params, trackballControls, cylinder, cone;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    
    renderer = new THREE.WebGLRenderer({ antialias: true});
    //renderer.setClearColor(0xEEEEEE, 1)
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMapEnabled = true;
    
    document.body.appendChild( renderer.domElement );


    camera.position.x = 3;
    camera.position.y = 3;
    camera.position.z = 3;
    camera.lookAt(scene.position);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0, 50, 50);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const axesHelper = new THREE.AxesHelper( 50 );
    scene.add( axesHelper );

    $("#WebGL-output").append(renderer.domElement);

    params = {
        rotationX: 0.00,
        rotationY: 0.00,
        length: 1,
        radius: 1,
        color: 0xff00ff,
        direction: {
            x: 1.0,
            y: 0.00,
            z: 0.00,
        },
        origin: {
            x: 0.00,
            y: 0.00,
            z: 0.00,
        }
    };

    var cylinderHeight = params.length * 0.8;
    var coneHeight = params.length * 0.2;
    var coneWidth = params.radius * coneHeight;
    var cylinderWidth = 0.4 * coneWidth;

    const cylinderGeometry = new THREE.CylinderGeometry( cylinderWidth, cylinderWidth, cylinderHeight, 30 );
    const cylinderMaterial = new THREE.MeshLambertMaterial( {color: params.color} );
    cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
    cylinder.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, cylinderHeight / 2, 0 ) );

    const coneGeometry = new THREE.ConeGeometry( coneWidth, coneHeight, 30 );
    const coneMaterial = new THREE.MeshLambertMaterial( {color: params.color} );
    cone = new THREE.Mesh( coneGeometry, coneMaterial );
    cone.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, cylinderHeight + coneHeight / 2, 0 ) );

    group = new THREE.Object3D();
    group.add( cylinder );
    group.add( cone );


    setDirection();
    prepareDatGui();
    
    scene.add(group);
    
    trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
    
    function prepareDatGui() {
        var gui = new dat.GUI();
        var direction = gui.addFolder('direction');
        direction.add(params.direction, 'x', -5, 5).onChange(() => setDirection());
        direction.add(params.direction, 'y', -5, 5).onChange(() => setDirection());
        direction.add(params.direction, 'z', -5, 5).onChange(() => setDirection());

        direction.open();

        var origin = gui.addFolder('origin');
        origin.add(params.origin, 'x', -5, 5).onChange(() => setOrigin());
        origin.add(params.origin, 'y', -5, 5).onChange(() => setOrigin());
        origin.add(params.origin, 'z', -5, 5).onChange(() => setOrigin());

        origin.open();
        
        gui.add(params, 'length', 0, 10).onChange(() => setLength());
        gui.add(params, 'radius', 0, 2).onChange(() => {
            group.scale.x = params.radius;
            group.scale.z = params.radius;
        });
        gui.addColor( params, 'color' ).onChange( function() { 
            cone.material.color.set( params.color );
            cylinder.material.color.set( params.color );
        });
    }
    
    function setOrigin(origin) {
        let originParams = origin || params.origin;
        const originVector = new THREE.Vector3( originParams.x, originParams.y, originParams.z );
        group.position.copy( originVector );
    }

    function setLength() {
        group.scale.y = params.length;
    }

    function setDirection() {
        let vector = new THREE.Vector3(params.direction.x, params.direction.y, params.direction.z);
        vector.normalize();
		if ( vector.y > 0.99999 )
			group.quaternion.set( 0, 0, 0, 1 );
		else if ( vector.y < - 0.99999 )
			group.quaternion.set( 1, 0, 0, 0 );
		else {
            let axis = new THREE.Vector3();;
			axis.set( vector.z, 0, - vector.x ).normalize();
			const radians = Math.acos( vector.y );
			group.quaternion.setFromAxisAngle( axis, radians );
		}
	}
}

function render() {
    trackballControls.update();
	renderer.render( scene, camera );
	requestAnimationFrame( render );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('resize', onWindowResize, false);

init();
render();