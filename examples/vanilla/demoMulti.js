import { Grid } from "../../src/core/grid.js";
import { MultiEngine } from "../../src/core/multiEngine.js";
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
  outOfBoundsColor: "lightgray",
  gridBackgroundColor: "white",
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


const lifeSpanGrid = new Grid(grid.width, grid.height, Float32Array);

// engine

function update(g, _dt, grids) {
  const lifeGrid = grids[1].nextGrid;

  if (mouse.down) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = mouse.x + dx;
        const y = mouse.y + dy;
        g.set(x, y, 1);
        lifeGrid.set(x, y, 100);
      }
    }
  }
}

function updateCell(current, next, x, y, _dt, grids) {
  if (current.get(x, y) !== 1) return;

  const currentLife = grids[1].grid;
  const nextLife = grids[1].nextGrid;

  const life = currentLife.get(x, y);

  if (life <= 0) {
    next.set(x, y, 0);
    nextLife.set(x, y, 0);
    return;
  }

  const below   = { x,     y: y + 1 };
  const bottomR = { x: x+1, y: y + 1 };
  const bottomL = { x: x-1, y: y + 1 };

  const isEmpty = (pos) => (current.get(pos.x, pos.y) === 0) && (next.get(pos.x, pos.y) === 0);

  let dest = null;
  if (isEmpty(below)) dest = below;
  else if (isEmpty(bottomR) && isEmpty(bottomL)) dest = Math.random() < 0.5 ? bottomR : bottomL;
  else if (isEmpty(bottomR)) dest = bottomR;
  else if (isEmpty(bottomL)) dest = bottomL;
  
  if (dest) {
    next.set(dest.x, dest.y, 1);
    nextLife.set(dest.x, dest.y, life);
    nextLife.set(x, y, 0);
  } else {
    nextLife.set(x, y, life);
    next.set(x, y, 1);
  }
}

function updateLifeSpan(_current, next, x, y, _dt, grids) {
  const life = next.get(x, y);
  if (life > 0) {
    next.set(x, y, Math.max(0, life - 0.1));
  }
}

const greenBeginnings = (v) => v === 1 ? [200, 200, 0, 255] : [255, 255, 255, 0];
const yellowDeath = (v) => [255, 255, 255, 255 - v*2.5];

const engine = new MultiEngine({
  grids: [
    { grid: grid, updateCell: updateCell, update: update, dataToColor: greenBeginnings },
    { grid: lifeSpanGrid, updateCell: updateLifeSpan, dataToColor: yellowDeath },
  ],
  scanOrder: "shuffle"
});

engine.start(renderer);

setInterval(() => {
  fpsDisplay.textContent = engine.fps.toFixed(1) + " fps";
}, 250);