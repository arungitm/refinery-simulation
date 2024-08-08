let scene, camera, renderer, gui, controls;
let refineryComponents = {};
let flowAnimations = [];
let truck;
let isUserControlled = false;

const params = {
    crudeInput: 50,
    distillationTemp: 350,
    catalystEfficiency: 0.75,
    specificGravity: 0.85
};

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    camera.position.set(0, 5, 10); // Adjust these values to zoom in closer
    camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    document.getElementById('loading-screen').style.display = 'block';
    createRefinery();
    loadTruck();
    setupGUI();

    document.getElementById('take-control').addEventListener('click', takeControl);

    animate();
    startTime = Date.now();
}

function createRefinery() {
    console.log('Starting to load refinery...');
    const loader = new THREE.GLTFLoader();
    loader.load(
        'https://firebasestorage.googleapis.com/v0/b/refinery-92e4b.appspot.com/o/distillery-equipment.glb?alt=media&token=2964ab4e-72ba-4b42-9430-7f5163ac2f38', // Include the access token
        function (gltf) {
            console.log('Refinery equipment loaded successfully');
            refineryComponents.refinery = gltf.scene;
            refineryComponents.refinery.position.set(0, 0, 0);
            refineryComponents.refinery.scale.set(0.1, 0.1, 0.1); // Adjust scale as needed
            scene.add(refineryComponents.refinery);

            if (gltf.scene.children.length === 0 || !gltf.scene.children[0].material) {
                console.warn('No materials found, applying default');
                applyDefaultMaterials(gltf.scene);
            }

            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('take-control').style.display = 'block';
        },
        function (xhr) {
            console.log('Refinery: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened while loading the refinery', error);
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('take-control').style.display = 'block';
        }
    );
}

function loadTruck() {
    console.log('Starting to load truck...');
    const loader = new THREE.GLTFLoader();
    loader.load(
        'https://firebasestorage.googleapis.com/v0/b/refinery-92e4b.appspot.com/o/truck.glb?alt=media&token=4fb5bfbd-5b28-429a-a91c-2f83184802c9', // Include the access token
        function (gltf) {
            console.log('Truck loaded successfully', gltf);
            truck = gltf.scene;
            truck.scale.set(0.1, 0.1, 0.1);
            truck.position.set(2, 0, 0);
            truck.rotation.y = Math.PI / 2;
            scene.add(truck);
            console.log('Truck added to scene');
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Error loading truck:', error);
        }
    );
}


function setupGUI() {
    gui = new dat.GUI({ autoPlace: false });
    document.getElementById('gui-container').appendChild(gui.domElement);

    gui.add(params, 'crudeInput', 0, 100).name('Crude Oil Input').onChange(updateRefinery);
    gui.add(params, 'distillationTemp', 0, 400).name('Distillation Temp').onChange(updateRefinery);
    gui.add(params, 'catalystEfficiency', 0, 1).name('Catalyst Efficiency').onChange(updateRefinery);
    gui.add(params, 'specificGravity', 0, 2).name('Specific Gravity').onChange(updateRefinery);
}

function updateRefinery() {
    // Update visual elements
    if (refineryComponents.refinery) {
        refineryComponents.refinery.traverse((child) => {
            if (child.isMesh) {
                child.material.color.setHex(0xffcc00);
            }
        });
    }

    // Update flow speed based on crude input
    const inputFlowSpeed = params.crudeInput / 1000; // Adjust this factor as needed
    const outputFlowSpeed = calculateOutputFlow(params.crudeInput, params.distillationTemp, params.catalystEfficiency);

    flowAnimations.forEach((animation, index) => {
        animation.speed = index === flowAnimations.length - 1 ? outputFlowSpeed : inputFlowSpeed;
    });

    updateOutput();
}

function calculateOutputFlow(crudeInput, distillationTemp, catalystEfficiency) {
    const distillationFactor = Math.min(1, distillationTemp / 400);
    const output = crudeInput * distillationFactor * catalystEfficiency;
    return output / 1000; // Adjust this factor as needed for animation speed
}

function updateOutput() {
    const outputFlow = calculateOutputFlow(params.crudeInput, params.distillationTemp, params.catalystEfficiency);
    const efficiency = (outputFlow / params.crudeInput) * 100;

    const apiGravity = (141.5 / params.specificGravity) - 131.5;

    document.getElementById('output-efficiency').textContent = `Refinery Efficiency: ${efficiency.toFixed(1)}%`;
    document.getElementById('output-flow').textContent = `Output Flow: ${outputFlow.toFixed(2)} barrels/hour`;
    document.getElementById('api-gravity').textContent = `API Gravity: ${apiGravity.toFixed(2)}`;
}

function animate() {
    requestAnimationFrame(animate);

    if (isUserControlled) {
        controls.update();
    }

    renderer.render(scene, camera);
}

function takeControl() {
    isUserControlled = true;
    controls.enabled = true;
    document.getElementById('take-control').style.display = 'none';
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('load', init);
