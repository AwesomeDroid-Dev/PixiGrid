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

// --- Color palette ---
const palette = {
  1: [200, 200, 0, 255],   // yellow
  2: [0, 200, 200, 255],   // cyan
  3: [200, 0, 200, 255],   // magenta
  4: [200, 0, 0, 255],     // red
  5: [0, 200, 0, 255],     // green
  6: [0, 0, 200, 255],     // blue
  7: [100, 100, 100, 255], // gray
  8: [255, 165, 0, 255],   // orange
  9: [128, 0, 128, 255],   // purple
  10: [0, 0, 0, 255],      // black
  0: [255, 255, 255, 255], // eraser (white)
};

let currentColor = 1; // default color

const renderer = new Renderer(ctx, grid, {
  dataToColor: (value) => palette[value] || [255, 255, 255, 255],
  camera,
  afterRender: (ctx, grid, camera) => {
    ctx.save();
    ctx.translate(
      (mouse.x - camera.x) * camera.zoom,
      (mouse.y - camera.y) * camera.zoom
    );
    ctx.strokeStyle = currentColor === 0 ? "black" : "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      -Math.floor(brushSize / 2) * camera.zoom,
      -Math.floor(brushSize / 2) * camera.zoom,
      brushSize * camera.zoom,
      brushSize * camera.zoom
    );
    ctx.restore();
  }
});

// mouse state
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

document.addEventListener("mouseup", e => {
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
canvas.addEventListener("wheel", e => {
  e.preventDefault();

  const { sx, sy, gx, gy } = screenToGrid(e);

  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  const newZoom = Math.max(0.1, Math.min(20, camera.zoom * zoomFactor));

  camera.x = gx - sx / newZoom;
  camera.y = gy - sy / newZoom;
  camera.zoom = newZoom;
});

let brushSize = 1;

document.addEventListener("keydown", e => {
  if (e.key >= "0" && e.key <= "9") {
    currentColor = parseInt(e.key, 10);
  } else if (e.key === "10") {
    currentColor = 10;
  } else if (e.key === "[") {
    brushSize = Math.max(1, brushSize - 1);
  } else if (e.key === "]") {
    brushSize = Math.min(50, brushSize + 1);
  }
});

// --- Key controls for colors ---
document.addEventListener("keydown", e => {
  if (e.key >= "0" && e.key <= "9") {
    currentColor = parseInt(e.key, 10);
  } else if (e.key === "10") {
    currentColor = 10;
  }
});

// engine
const engine = new Engine({
  grid,
  update: g => {
    if (mouse.down) {
      const half = Math.floor(brushSize / 2);
      for (let dx = -half; dx < brushSize - half; dx++) {
        for (let dy = -half; dy < brushSize - half; dy++) {
          g.set(mouse.x + dx, mouse.y + dy, currentColor);
        }
      }
    }
  }
});

engine.start(renderer);

setInterval(() => {
  fpsDisplay.textContent = engine.fps.toFixed(1) + " fps";
}, 250);