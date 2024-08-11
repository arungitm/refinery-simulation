import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'dat.gui';

let scene, camera, renderer, gui, controls;
const refineryComponents = {};
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

    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    document.getElementById('loading-screen').style.display = 'block';
    createRefinery();
    loadTruck();
    setupGUI();

    document.getElementById('take-control').addEventListener('click', takeControl);

    animate();
}

function createRefinery() {
    console.log('Starting to load refinery...');
    const loader = new GLTFLoader();
    const firebaseUrl = 'https://firebasestorage.googleapis.com/v0/b/refinery-92e4b.appspot.com/o/distillery-equipment.glb?alt=media&token=9b72824d-e0c3-4325-82c2-9812d0e76e97';
    console.log('Loading refinery from:', firebaseUrl);
    loader.load(
        firebaseUrl,
        function (gltf) {
            console.log('Refinery equipment loaded successfully');
            refineryComponents.refinery = gltf.scene;
            refineryComponents.refinery.position.set(0, 0, 0);
            refineryComponents.refinery.scale.set(0.1, 0.1, 0.1);
            scene.add(refineryComponents.refinery);

            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('take-control').style.display = 'block';
        },
        function (xhr) {
            console.log('Refinery: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened while loading the refinery:', error);
            console.error('Attempted URL:', firebaseUrl);
            document.getElementById('loading-screen').style.display = 'none';
            alert('Failed to load refinery model. Please check console for details.');
        }
    );
}

function loadTruck() {
    console.log('Starting to load truck...');
    const loader = new GLTFLoader();
    const firebaseUrl = 'https://firebasestorage.googleapis.com/v0/b/refinery-92e4b.appspot.com/o/truck.glb?alt=media&token=4fb5bfbd-5b28-429a-a91c-2f83184802c9';
    console.log('Loading truck from:', firebaseUrl);
    loader.load(
        firebaseUrl,
        function (gltf) {
            console.log('Truck loaded successfully');
            truck = gltf.scene;
            truck.scale.set(0.1, 0.1, 0.1);
            truck.position.set(2, 0, 0);
            truck.rotation.y = Math.PI / 2;
            scene.add(truck);
        },
        function (xhr) {
            console.log('Truck: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Error loading truck:', error);
            console.error('Attempted URL:', firebaseUrl);
            alert('Failed to load truck model. Please check console for details.');
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
    const inputFlowSpeed = params.crudeInput / 1000;
    const outputFlowSpeed = calculateOutputFlow(params.crudeInput, params.distillationTemp, params.catalystEfficiency);

    flowAnimations.forEach((animation, index) => {
        animation.speed = index === flowAnimations.length - 1 ? outputFlowSpeed : inputFlowSpeed;
    });

    updateOutput();
}

function calculateOutputFlow(crudeInput, distillationTemp, catalystEfficiency) {
    const distillationFactor = Math.min(1, distillationTemp / 400);
    const output = crudeInput * distillationFactor * catalystEfficiency;
    return output / 1000;
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

function addTooltips() {
    const tooltipData = {
        'crude-storage': 'Stores incoming crude oil before processing',
        'distillation-tower': 'Separates crude oil into different fractions',
        'catalytic-cracker': 'Breaks down heavy hydrocarbons into lighter ones',
    };

    Object.keys(tooltipData).forEach(componentId => {
        const component = scene.getObjectByName(componentId);
        if (component) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipData[componentId];

            component.userData.tooltip = tooltip;
            document.body.appendChild(tooltip);

            component.addEventListener('mouseover', showTooltip);
            component.addEventListener('mouseout', hideTooltip);
        }
    });
}

function showTooltip(event) {
    const tooltip = event.target.userData.tooltip;
    tooltip.style.display = 'block';
    tooltip.style.left = event.clientX + 'px';
    tooltip.style.top = event.clientY + 'px';
}

function hideTooltip(event) {
    event.target.userData.tooltip.style.display = 'none';
}

function createLegend() {
    const legend = document.createElement('div');
    legend.id = 'refinery-legend';
    legend.innerHTML = `
        <h3>Refinery Components</h3>
        <ul>
            <li><span class="legend-color" style="background-color: #808080;"></span> Crude Oil Storage</li>
            <li><span class="legend-color" style="background-color: #A0A0A0;"></span> Distillation Tower</li>
            <li><span class="legend-color" style="background-color: #C0C0C0;"></span> Catalytic Cracker</li>
        </ul>
    `;
    document.body.appendChild(legend);
}

let tourStep = 0;
const tourSteps = [
    { component: 'crude-storage', description: 'We start with crude oil storage...' },
    { component: 'distillation-tower', description: 'Next, the oil moves to the distillation tower...' },
];

function startGuidedTour() {
    tourStep = 0;
    showNextTourStep();
}

function showNextTourStep() {
    if (tourStep < tourSteps.length) {
        const step = tourSteps[tourStep];
        const component = scene.getObjectByName(step.component);
        if (component) {
            camera.position.copy(component.position);
            camera.position.z += 5;
            camera.lookAt(component.position);

            showTourDescription(step.description);
        }
        tourStep++;
    } else {
        endGuidedTour();
    }
}

function showTourDescription(description) {
    const tourBox = document.getElementById('tour-description') || document.createElement('div');
    tourBox.id = 'tour-description';
    tourBox.textContent = description;
    document.body.appendChild(tourBox);
}

function endGuidedTour() {
    const tourBox = document.getElementById('tour-description');
    if (tourBox) tourBox.remove();
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
}

window.addEventListener('load', init);

addTooltips();
createLegend();
document.getElementById('start-tour').addEventListener('click', startGuidedTour);
