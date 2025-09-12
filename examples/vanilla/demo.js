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

const renderer = new Renderer(ctx, grid, {
  dataToColor: (value) => value === 1 ? [200, 200, 0, 255] : [255, 255, 255, 255],
  camera
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


// engine
const engine = new Engine({
  grid,
  update: g => {
    if (mouse.down) {
      g.set(mouse.x, mouse.y, 1);
    }
  },
  updateCell(current, next, x, y) {
    if (current.get(x, y) !== 1) return; // not sand

    const below   = { x,     y: y + 1 };
    const bottomR = { x: x+1, y: y + 1 };
    const bottomL = { x: x-1, y: y + 1 };

    const isEmpty = (pos) => current.get(pos.x, pos.y) === 0;

    if (isEmpty(below)) {
      next.set(below.x, below.y, 1);
      return;
    }

    const canR = isEmpty(bottomR);
    const canL = isEmpty(bottomL);

    if (canR && canL) {
      if (Math.random() < 0.5) next.set(bottomR.x, bottomR.y, 1);
      else next.set(bottomL.x, bottomL.y, 1);
      return;
    }

    if (canR) return next.set(bottomR.x, bottomR.y, 1);
    if (canL) return next.set(bottomL.x, bottomL.y, 1);

    next.set(x, y, 1); // stay in place
  }
});

engine.start(renderer);

setInterval(() => {
  fpsDisplay.textContent = engine.fps.toFixed(1) + " fps";
}, 250);