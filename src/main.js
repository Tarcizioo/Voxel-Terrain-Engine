// src/main.js
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- 1. CONFIGURAÇÃO BÁSICA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x00BFFF); 
scene.fog = new THREE.Fog(0xEB87A4, 20, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Luzes
const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 100, 50);
dirLight.castShadow = true;
scene.add(dirLight);

// --- 2. GERADOR DE TERRENO ---
function getTerrainHeight(x, z) {
    const scale = 0.05;
    const y1 = Math.sin(x * scale) * Math.cos(z * scale) * 5;
    const y2 = Math.sin(x * scale * 2.5 + z * scale) * 2;
    return Math.floor(y1 + y2 + 5); 
}

// --- 3. CRIANDO OS VOXELS ---
const size = 50; 
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
// * Importante: Definir usage dynamic se formos modificar a matriz frequentemente, mas para esse demo static funciona
const mesh = new THREE.InstancedMesh(geometry, material, size * size * 10); 
mesh.castShadow = true;
mesh.receiveShadow = true;

const dummy = new THREE.Object3D();
const color = new THREE.Color();
let count = 0;

for (let x = -size/2; x < size/2; x++) {
    for (let z = -size/2; z < size/2; z++) {
        const h = getTerrainHeight(x, z);
        for(let y = h; y > h - 3; y--) { 
            dummy.position.set(x, y, z);
            dummy.updateMatrix();
            mesh.setMatrixAt(count, dummy.matrix);

            if (h < 3) color.setHex(0x008000); 
            else if (h < 7) color.setHex(0x32CD32); 
            else color.setHex(0x808080); 
            
            mesh.setColorAt(count, color);
            count++;
        }
    }
}
scene.add(mesh);

// --- 4. INTERAÇÃO E CONTROLES ---
const controls = new PointerLockControls(camera, document.body);
const instructions = document.getElementById('instructions');

instructions.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => instructions.style.display = 'none');
controls.addEventListener('unlock', () => instructions.style.display = 'block');

const move = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let canJump = false;

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp': case 'KeyW': move.forward = true; break;
        case 'ArrowLeft': case 'KeyA': move.left = true; break;
        case 'ArrowDown': case 'KeyS': move.backward = true; break;
        case 'ArrowRight': case 'KeyD': move.right = true; break;
        case 'Space': if (canJump) velocity.y += 15; canJump = false; break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp': case 'KeyW': move.forward = false; break;
        case 'ArrowLeft': case 'KeyA': move.left = false; break;
        case 'ArrowDown': case 'KeyS': move.backward = false; break;
        case 'ArrowRight': case 'KeyD': move.right = false; break;
    }
});

// --- LÓGICA DE QUEBRAR BLOCOS ---
const raycaster = new THREE.Raycaster();
const centerScreen = new THREE.Vector2(0, 0);
const dummyMatrix = new THREE.Matrix4();

document.addEventListener('click', () => {
    if (!controls.isLocked) return; 

    raycaster.setFromCamera(centerScreen, camera);
    const intersects = raycaster.intersectObject(mesh);

    if (intersects.length > 0) {
        const hit = intersects[0];
        const instanceId = hit.instanceId;

        mesh.getMatrixAt(instanceId, dummyMatrix);
        dummyMatrix.elements[0] = 0; // Escala X = 0
        dummyMatrix.elements[5] = 0; // Escala Y = 0
        dummyMatrix.elements[10] = 0; // Escala Z = 0
        
        mesh.setMatrixAt(instanceId, dummyMatrix);
        mesh.instanceMatrix.needsUpdate = true;
    }
});

// --- 5. LOOP DE ANIMAÇÃO ---
let prevTime = performance.now();
let lastFpsTime = prevTime;
let frameCount = 0;
const debugElement = document.getElementById('debug');
const playerHeight = 1.8;

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    
    // FPS Counter
    frameCount++;
    if (time - lastFpsTime >= 1000) {
        debugElement.innerText = "FPS: " + frameCount;
        frameCount = 0;
        lastFpsTime = time;
    }

    if (controls.isLocked) {
        velocity.y -= 30 * delta;
        velocity.x -= velocity.x * 5.0 * delta;
        velocity.z -= velocity.z * 5.0 * delta;

        direction.z = Number(move.forward) - Number(move.backward);
        direction.x = Number(move.right) - Number(move.left);
        direction.normalize();

        if (move.forward || move.backward) velocity.z -= direction.z * 40.0 * delta;
        if (move.left || move.right) velocity.x -= direction.x * 40.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        controls.getObject().position.y += velocity.y * delta;

        const px = controls.getObject().position.x;
        const pz = controls.getObject().position.z;
        const terrainH = getTerrainHeight(Math.round(px), Math.round(pz));

        if (controls.getObject().position.y < terrainH + playerHeight) {
            velocity.y = 0;
            controls.getObject().position.y = terrainH + playerHeight;
            canJump = true;
        }
    }

    prevTime = time;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();