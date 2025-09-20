import { blendPixel } from "./utils.js";

export class Renderer {
  constructor(ctx, grid, options = {}) {
    this.ctx = ctx;
    this.grid = grid;
    this.width = grid.width;
    this.height = grid.height;

    const StorageType = grid.data.constructor;
    this.prev = new StorageType(grid.width * grid.height);

    this.dataToColor = options.dataToColor || Renderer.defaultColor;
    this.outOfBoundsColor = options.outOfBoundsColor || "black";
    this.gridBackgroundColor = options.gridBackgroundColor || options.outOfBoundsColor;
    this.camera = options.camera || new Camera(0, 0, 1);

    this.offscreen = document.createElement("canvas");
    this.offscreen.width = this.width;
    this.offscreen.height = this.height;
    this.offscreenCtx = this.offscreen.getContext("2d");

    this.image = this.offscreenCtx.createImageData(this.width, this.height);
    this.data = this.image.data;

    this.afterRender = options.afterRender || function() {};
  }

  draw(grid, { clearBg = true, dataToColor = null } = {}) {
    const data = this.data;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const value = grid.get(x, y);
        const [r, g, b, a] = dataToColor ? dataToColor(value, x, y, idx) : this.dataToColor(value, x, y, idx);

        const p = idx * 4;
        data[p] = r;
        data[p + 1] = g;
        data[p + 2] = b;
        data[p + 3] = a;
      }
    }

    if (clearBg) {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    this.drawImageData();

    this.afterRender(this.ctx, grid, this.camera);
  }

  drawAll(grids) {
    const data = this.data;
    data.fill(0); // transparent clear

    for (let layer of grids) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = y * this.width + x;
          const p = idx * 4;

          const value = layer.grid.get(x, y);
          const src = layer.dataToColor ? layer.dataToColor(value, x, y, idx) : this.dataToColor(value, x, y, idx);
          if (src[3] === 0) continue;

          const dst = [
            data[p],
            data[p + 1],
            data[p + 2],
            data[p + 3]
          ];

          const [r, g, b, a] = blendPixel(dst, src);
          data[p]     = r;
          data[p + 1] = g;
          data[p + 2] = b;
          data[p + 3] = a;
        }
      }
    }

    this.drawImageData();

    this.afterRender();
  }

  drawImageData() {
    const viewWidth = this.ctx.canvas.width / this.camera.zoom;
    const viewHeight = this.ctx.canvas.height / this.camera.zoom;

    this.ctx.fillStyle = this.outOfBoundsColor;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (this.gridBackgroundColor) {
      const gridX = -this.camera.x * this.camera.zoom;
      const gridY = -this.camera.y * this.camera.zoom;
      const gridW = this.grid.width * this.camera.zoom;
      const gridH = this.grid.height * this.camera.zoom;

      this.ctx.fillStyle = this.gridBackgroundColor;
      this.ctx.fillRect(gridX, gridY, gridW, gridH);
    }


    this.offscreenCtx.putImageData(this.image, 0, 0);
    this.ctx.imageSmoothingEnabled = false;

    this.ctx.drawImage(
      this.offscreen,
      this.camera.x, this.camera.y, viewWidth, viewHeight,
      0, 0, this.ctx.canvas.width, this.ctx.canvas.height
    );
  }

  static defaultColor(value) {
    if (typeof value === "number") {
      if (Number.isInteger(value)) {
        return value === 0
          ? [255, 255, 255, 255]
          : [0, 0, 0, 255];
      } else {
        const gray = Math.max(0, Math.min(1, value)) * 255;
        return [gray, gray, gray, 255];
      }
    }
    return [255, 255, 255, 0];
  }
}