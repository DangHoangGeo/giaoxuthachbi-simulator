## Church Simulator Technical Architecture Blueprint
> **Status, 5 October 2026:** This earlier simulator sketch contains illustrative circuit limits and audio assumptions. Use the [interior and building systems plan](docs/interior-systems-plan.md) for the current design brief and research. The wattage caps below are not engineered circuit ratings; generic WebAudio reverb is not a geometric acoustic prediction.

This document provides a localized technical roadmap, an electrical layout strategy, and an interactive testing framework to build your web-based Three.js simulator. It focuses on optimization, visual placement, and acoustic simulation while incorporating functional electrical design logic.
------------------------------
## 1. Core Technical Architecture & Dependencies
To build this locally, create a standard Webpack, Vite, or simple Node.js project. You will combine 3D graphics rendering with structural audio graph processing.

                  ┌─────────────────── Web Audio API (AudioContext) ──────────────────┐
                  │                                                                   │
[ User Controls ] ┼──► [ Three.js Camera (AudioListener) ]                            ├──► [ Output Speakers ]
                  │                                                                   │
                  └──► [ 3D Space (Renderer) ] ◄── [ PositionalAudio (ConvolverNode) ]┘

## 📦 Node Packages (package.json)

{
  "name": "church-3d-simulator",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "three": "^0.160.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}

------------------------------
## 2. Design Blueprint: Fixture & Electrical Placement
When designing the spatial layout inside your 3D canvas and mapping your technical logic, use this foundational layout mapping for lighting, sound, mechanical fans, and electrical infrastructure.
## 💡 Lighting Layout Design

* The Liturgical Altar (Focus Point): Use high-intensity THREE.SpotLight pointing directly at the altar/pulpit. High shadow map resolution (2048x2048) is mandatory here to capture sharp outlines of pillars.
* The Nave (Seating/Pews): Place lower-intensity THREE.PointLight objects hanging sequentially to mimic chandeliers. Space them uniformly so light cones overlap by roughly 20% to avoid jarring pitch-black blind spots.
* The Stained Glass Windows: Place high-energy THREE.DirectionalLight objects outside pointing inward. Apply a colorful .map texture directly onto the light projection matrix to fake complex window refraction without demanding ray-tracing calculations.

## 🔊 Audio & Acoustic Design

* The Audio Listener: Permanently bound to the active First-Person Camera instance.
* The Structural Sound Sources: Anchor dynamic THREE.PositionalAudio elements onto specific physical points inside your scene geometry:
* The Choir Loft / Pipe Organ: Broad directional cone (setOrientation, angle: 90° to 120°) directing music down the central nave.
   * The Pulpit/Microphone: Highly focused directional cone (angle: 45°) targeting the main floor.
* Reverb & Reflection Model: Pass all signals through an internal ConvolverNode loaded with an Impulse Response (IR) sound profile of a stone hall. This forces real-time calculations to simulate echoes off hard, grand surfaces.

## 🌀 Ceiling Fans & Airflow Design

* Simulation Logic: Ceiling fans do not give off native light or spatial sound, but they impact mechanical structural planning. Group each fan unit into an isolated THREE.Group node containing a base mesh and a blade sub-mesh. Run an explicit update clock in your rendering loop to spin the blades over time (blades.rotation.y += speed * delta).
* Optimizing Shadow Cascades: If fans sit directly under a chandelier light source, disabling shadow-casting (castShadow = false) for the rotating fan blades prevents jarring high-frequency strobe-shadow flickers across the environment floor.

## ⚡ Electrical Grid Circuit Mapping
To create an authentic simulation layer, you should map your components conceptually to isolated electrical switches. Create an associative structure tracking load allocation:

| Grid ID | Circuit Name | Attached Simulation Components | Max Load Limit |
|---|---|---|---|
| CKT-01 | Sanctuary Lighting | Altar Spotlights, Nave Accent Lights | 1800 W |
| CKT-02 | Mechanical Vent | Ceiling Fans, HVAC blowers | 2400 W |
| CKT-03 | Audio Rack | Pulpit Mic Receiver, Amplifiers, Organ Pre-amps | 1200 W |

------------------------------
## 3. Local Automation Code Template
Create a local index file main.js to initialize the modular layers, electrical switch states, and real-time animation.

import * as THREE from 'three';import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
// --- SYSTEM INITIALIZATION ---const scene = new THREE.Scene();const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
// --- ELECTRICAL CONTROL STATE ---const ElectricalPanel = {
    ckt01_lighting: true,
    ckt02_fans: true,
    ckt03_audio: true
};
// --- SIMULATION ARRAYS ---const fanBladesArray = [];const activeAudioSources = [];
// --- GLOBAL AUDIO LISTENER ---const listener = new THREE.AudioListener();
camera.add(listener);
// --- CORE UTILITY FACTORIES ---function createCeilingFan(position) {
    const fanGroup = new THREE.Group();
    fanGroup.position.copy(position);

    // Static Anchor Pipe
    const rodGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
    const rod = new THREE.Mesh(rodGeo, metalMat);
    rod.position.y = 0.5;
    fanGroup.add(rod);

    // Rotating Blades Hub
    const bladeHub = new THREE.Group();
    const centerGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12);
    const center = new THREE.Mesh(centerGeo, metalMat);
    bladeHub.add(center);

    // 4 Quad Blades
    const bladeGeo = new THREE.BoxGeometry(1.5, 0.02, 0.2);
    for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(bladeGeo, metalMat);
        blade.rotation.y = (Math.PI / 2) * i;
        blade.position.x = Math.sin((Math.PI / 2) * i) * 0.75;
        blade.position.z = Math.cos((Math.PI / 2) * i) * 0.75;
        bladeHub.add(blade);
    }
    
    fanGroup.add(bladeHub);
    scene.add(fanGroup);
    fanBladesArray.push(bladeHub); // Register for execution frame loop
}
function createPositionalSound(parentMesh, fileUrl, refDist = 8) {
    const sound = new THREE.PositionalAudio(listener);
    const audioLoader = new THREE.AudioLoader();
    
    audioLoader.load(fileUrl, (buffer) => {
        sound.setBuffer(buffer);
        sound.setRefDistance(refDist);
        sound.setDistanceModel('linear');
        sound.setLoop(true);
        sound.setVolume(1.0);
        sound.play();
    });

    parentMesh.add(sound);
    activeAudioSources.push({ component: sound, circuit: 'ckt03_audio' });
}
// --- GENERATING TEST ENVIRONMENT INTERIORS ---// Altar Blockconst altarGeo = new THREE.BoxGeometry(4, 1.2, 2);const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.7 });const altar = new THREE.Mesh(altarGeo, woodMat);
altar.position.set(0, 0.6, -15);
altar.receiveShadow = true;
altar.castShadow = true;
scene.add(altar);
// Instantiating Fixtures
createCeilingFan(new THREE.Vector3(0, 10, -5));
createCeilingFan(new THREE.Vector3(0, 10, -12));
createPositionalSound(altar, 'assets/sermon_pulpit.mp3', 6);
// Overhanging Altar Spotlightsconst altarSpot = new THREE.SpotLight(0xfff3d1, 5, 30, Math.PI / 6, 0.5, 1);
altarSpot.position.set(0, 12, -15);
altarSpot.target = altar;
altarSpot.castShadow = true;
scene.add(altarSpot);
const lightingComponents = [{ component: altarSpot, circuit: 'ckt01_lighting' }];
// --- SYSTEM RENDERING LOOP ---const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // 1. Process Mechanical Fan Rotation Loop
    if (ElectricalPanel.ckt02_fans) {
        fanBladesArray.forEach(hub => {
            hub.rotation.y += 4.5 * delta; // Mechanical spinning velocity
        });
    }

    // 2. Real-time Electrical Dependency Verification
    lightingComponents.forEach(item => {
        item.component.visible = ElectricalPanel[item.circuit];
    });

    activeAudioSources.forEach(item => {
        if (!ElectricalPanel[item.circuit] && item.component.isPlaying) {
            item.component.pause();
        } else if (ElectricalPanel[item.circuit] && !item.component.isPlaying && item.component.buffer) {
            item.component.play();
        }
    });

    renderer.render(scene, camera);
}
// Window Scaling Adapters
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

------------------------------
## 4. Implementation Rig: Comprehensive QA Verification Protocol
Execute these functional test procedures locally to verify your lighting engine optimization, acoustic falloff models, and simulation constraints.
## Test Phase A: Performance Optimization Verification

* Draw Call Evaluation: Open the browser developer console and verify total draw calls using renderer.info.render.calls. If rendering the full structural nave exceeds 150 draw calls, group static interior wooden benches using BufferGeometryUtils.mergeGeometries.
* Frustum Culling Stability: Position the camera at the back entrance wall facing away from the church altar. Verify that frame processing drops zero frames, and confirm that geometric elements outside the camera's view field are ignored dynamically.
* Shadow Map Memory Leak Test: Continuously trigger lighting circuit state changes over a two-minute window (ElectricalPanel.ckt01_lighting = !ElectricalPanel.ckt01_lighting). Verify that VRAM usage remains flat on the GPU timeline performance graph.

## Test Phase B: Acoustic Integrity Assessment

* Inverse Square Attenuation Check: Approach the altar source with your camera avatar while running an audio track. Verify that spatial audio volume scales naturally without abrupt jumps as you move closer or farther away.
* Geometric Left/Right Panning Audit: Position your avatar facing exactly 90° away from the choir sound source. Ensure that the opposite stereo audio channel pans down to zero volume, matching your orientation.
* Convolver Reverb Decay Check: Unplug the main impulse response buffer asset. Confirm that the simulation falls back gracefully to a dry sound file, verifying that missing asset errors don't crash your entire code loop.

## Test Phase C: Electrical Logic Integration Verification

* Tripped Breaker System Isolation: Manually set your panel state object to ckt01_lighting = false. Verify that the scene instantly drops heavy directional spotlights while ambient light configurations and mechanical fan objects keep running perfectly.

------------------------------
## 5. Architectural Sandbox Tool
If you want to visualize how your design elements fall off dynamically before testing your local setup, use this interactive inspector tool to check light penetration, fan positioning, and sound decay rings.
Would you like to build out the user interface controls so you can click switches on the screen to turn circuits on and off, or should we look at how to set up ambient light bouncing to simulate stained glass colors hitting the floor?
