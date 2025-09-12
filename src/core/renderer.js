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
    this.camera = options.camera || new Camera(0, 0, 1);

    // Create offscreen canvas
    this.offscreen = document.createElement("canvas");
    this.offscreen.width = this.width;
    this.offscreen.height = this.height;
    this.offscreenCtx = this.offscreen.getContext("2d");

    // Create ImageData
    this.image = this.offscreenCtx.createImageData(this.width, this.height);
    this.data = this.image.data;

    this.afterRender = options.afterRender || function() {};
  }

  draw(grid) {
    const data = this.data;

    // Fill ImageData pixel array
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const value = grid.get(x, y);
        const [r, g, b, a] = this.dataToColor(value, x, y, idx);

        const p = idx * 4;
        data[p] = r;
        data[p + 1] = g;
        data[p + 2] = b;
        data[p + 3] = a;
      }
    }

    // Put ImageData on offscreen once
    this.offscreenCtx.putImageData(this.image, 0, 0);

    this.ctx.imageSmoothingEnabled = false;

    const viewWidth = this.ctx.canvas.width / this.camera.zoom;
    const viewHeight = this.ctx.canvas.height / this.camera.zoom;

    // Fill background
    this.ctx.fillStyle = this.outOfBoundsColor;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Draw offscreen canvas to main canvas
    this.ctx.drawImage(
      this.offscreen,
      this.camera.x, this.camera.y, viewWidth, viewHeight,
      0, 0, this.ctx.canvas.width, this.ctx.canvas.height
    );

    this.afterRender(this.ctx, grid, this.camera);
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