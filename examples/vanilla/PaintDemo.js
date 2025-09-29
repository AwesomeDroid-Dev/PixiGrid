import { Grid } from "../../src/core/grid.js";
import { Engine } from "../../src/core/engine.js";
import { Renderer } from "../../src/core/renderer.js";
import { Camera } from "../../src/core/camera.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const fpsDisplay = document.getElementById("fps");

const grid = new Grid(200, 100);

const fitZoom = Math.min(canvas.width / grid.width, canvas.height / grid.height);
const cameraX = (grid.width * fitZoom - canvas.width) / (2 * fitZoom);
const cameraY = (grid.height * fitZoom - canvas.height) / (2 * fitZoom);

const camera = new Camera(cameraX, cameraY, fitZoom);

canvas.addEventListener("contextmenu", e => e.preventDefault());

const palette = {
  1: [200, 200, 0, 255],
  2: [0, 200, 200, 255],
  3: [200, 0, 200, 255],
  4: [200, 0, 0, 255],
  5: [0, 200, 0, 255],
  6: [0, 0, 200, 255],
  7: [100, 100, 100, 255],
  8: [255, 165, 0, 255],
  9: [128, 0, 128, 255],
  10: [0, 0, 0, 255],
  0: [255, 255, 255, 255],
};

let currentColor = 1;
let lastDrawColor = 1;
let brushSize = 1;

const renderer = new Renderer(ctx, grid, {
  dataToColor: (value) => palette[value] || [255, 255, 255, 255],
  outOfBoundsColor: "lightgray",
  gridBackgroundColor: "white",
  camera
});

const mouse = { x: 0, y: 0, down: false, dragging: false, lastX: 0, lastY: 0 };

function screenToGrid(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const gx = Math.floor(camera.x + sx / camera.zoom);
  const gy = Math.floor(camera.y + sy / camera.zoom);
  return { gx, gy, sx, sy };
}

canvas.addEventListener("mousedown", e => {
  if (e.button === 0) {
    mouse.down = true;
  } else if (e.button === 1 || e.button === 2) {
    mouse.dragging = true;
    mouse.lastX = e.clientX;
    mouse.lastY = e.clientY;
  }
});

document.addEventListener("mouseup", () => {
  mouse.down = false;
  mouse.dragging = false;
});

canvas.addEventListener("mousemove", e => {
  const { gx, gy } = screenToGrid(e);
  mouse.x = gx;
  mouse.y = gy;
  if (mouse.dragging) {
    const dx = (e.clientX - mouse.lastX) / camera.zoom;
    const dy = (e.clientY - mouse.lastY) / camera.zoom;
    camera.move(-dx, -dy);
    mouse.lastX = e.clientX;
    mouse.lastY = e.clientY;
  }
});

let lastPinchDist = null;
let lastPan = null;

canvas.addEventListener("touchstart", e => {
  if (e.touches.length === 1) {
    const t = e.touches[0];
    const { gx, gy } = screenToGrid(t);
    mouse.down = true;
    mouse.x = gx;
    mouse.y = gy;
  } else {
    mouse.down = false;
  }
});

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (e.touches.length === 1) {
    const t = e.touches[0];
    const { gx, gy } = screenToGrid(t);
    mouse.x = gx;
    mouse.y = gy;
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const mid = {
      clientX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
      clientY: (e.touches[0].clientY + e.touches[1].clientY) / 2
    };
    if (lastPinchDist && lastPan) {
      const zoomFactor = dist / lastPinchDist;
      const { gx, gy, sx, sy } = screenToGrid(mid);
      const newZoom = Math.max(0.1, Math.min(20, camera.zoom * zoomFactor));
      camera.x = gx - sx / newZoom;
      camera.y = gy - sy / newZoom;
      camera.zoom = newZoom;
      const panDx = (mid.clientX - lastPan.x) / camera.zoom;
      const panDy = (mid.clientY - lastPan.y) / camera.zoom;
      camera.move(-panDx, -panDy);
    }
    lastPinchDist = dist;
    lastPan = { x: mid.clientX, y: mid.clientY };
  }
}, { passive: false });

canvas.addEventListener("touchend", () => {
  mouse.down = false;
  lastPinchDist = null;
  lastPan = null;
});

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const { sx, sy, gx, gy } = screenToGrid(e);
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  const newZoom = Math.max(0.1, Math.min(20, camera.zoom * zoomFactor));
  camera.x = gx - sx / newZoom;
  camera.y = gy - sy / newZoom;
  camera.zoom = newZoom;
});

document.addEventListener("keydown", e => {
  if (e.key >= "0" && e.key <= "9") {
    currentColor = parseInt(e.key, 10);
  } else if (e.key === "[") {
    brushSize = Math.max(1, brushSize - 1);
  } else if (e.key === "]") {
    brushSize = Math.min(50, brushSize + 1);
  }
});

document.getElementById("drawBtn").addEventListener("click", () => {
  currentColor = lastDrawColor;
});

document.getElementById("eraseBtn").addEventListener("click", () => {
  lastDrawColor = currentColor !== 0 ? currentColor : lastDrawColor;
  currentColor = 0;
});

document.querySelectorAll("#colorPalette button").forEach(btn => {
  btn.addEventListener("click", () => {
    const color = parseInt(btn.getAttribute("data-color"));
    currentColor = color;
    lastDrawColor = color;
    document.querySelectorAll("#colorPalette button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

const brushLabel = document.getElementById("brushLabel");
document.getElementById("sizeDown").addEventListener("click", () => {
  brushSize = Math.max(1, brushSize - 1);
  brushLabel.textContent = `Size: ${brushSize}`;
});
document.getElementById("sizeUp").addEventListener("click", () => {
  brushSize = Math.min(50, brushSize + 1);
  brushLabel.textContent = `Size: ${brushSize}`;
});

let clear = false;

document.getElementById("resetBtn").addEventListener("click", () => {
  clear = true;
});

function update(g) {
  if (clear) {
    g.clear();
    clear = false;
  }
  if (mouse.down) {
    const half = Math.floor(brushSize / 2);
    for (let dx = -half; dx < brushSize - half; dx++) {
      for (let dy = -half; dy < brushSize - half; dy++) {
        g.set(mouse.x + dx, mouse.y + dy, currentColor);
      }
    }
  }
}

const engine = new Engine({
  grids: [{ grid, update }]
});

engine.start(renderer);

setInterval(() => {
  fpsDisplay.textContent = engine.fps.toFixed(1) + " fps";
}, 250);
