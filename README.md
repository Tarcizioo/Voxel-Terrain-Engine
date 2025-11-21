# 🌲 Voxel Terrain Engine (Three.js)

A real-time voxel rendering experiment running directly in the browser, inspired by engines like Minecraft.

This project began as a personal challenge to replicate the voxel terrain aesthetic seen in Sebastian Aaltonen's WebGPU demos. My goal was to achieve a similar visual style and performance using standard WebGL via Three.js. It serves as a study on rendering optimization, procedural generation, and 3D game logic within the browser.

![Badge In Development](https://img.shields.io/badge/Status-In%20Development-yellow)
![Badge ThreeJS](https://img.shields.io/badge/Tech-Three.js-black)

---

## 🎮 Live Demo

**[Click here to play](https://tarcizioo.github.io/Voxel-Terrain-Engine/)**
---

## ✨ Features

* **Procedural Generation:** Terrain is mathematically generated using noise algorithms (sine waves), automatically creating valleys and mountains.
* **Optimized Rendering:** Uses `THREE.InstancedMesh` to draw thousands of blocks with a single Draw Call, maintaining 60 FPS.
* **Basic Physics:** Simple collision system with the ground and simulated gravity.
* **Interaction:** Raycasting for block detection and visual destruction.
* **FPS Controls:** Classic WASD movement + Jump and mouse look (Pointer Lock).

## 🛠️ Tech Stack

* **JavaScript (ES6 Modules)**
* **Three.js** (3D Library)
* **HTML5 & CSS3**

## 🕹️ Controls

| Key | Action |
| :--- | :--- |
| **W, A, S, D** | Move character |
| **SPACE** | Jump |
| **MOUSE** | Look around |
| **LEFT CLICK** | Break block (Visual) |
| **ESC** | Pause / Unlock cursor |

## 🚀 How to run locally

To run this project on your machine, you will need a simple local server (due to browser ES6 module security policies).

## 🧠 Deep Dive

### InstancedMesh Optimization
Instead of creating 20,000 separate `Mesh` objects (which would crash the browser), i create just **one** geometry and **one** material. `InstancedMesh` replicates this object thousands of times on the GPU, allowing for vast worlds with no performance drop.

### Collision vs. Visuals
Currently, the collision system uses a mathematical heightmap function to determine ground level, separate from the visual mesh.
* *Known Limitation:* When breaking a block, it disappears visually (scale set to 0), but physical collision remains at the original location based on the math calculation.

---

## 📸 Screenshots

![Project Screenshot](gamedemo.png)

---

## 🤝 Credits

* Inspired by the graphics engineering work of [Sebastian Aaltonen](https://twitter.com/SebAaltonen).
* Built with [Three.js](https://threejs.org/).
