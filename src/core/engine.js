export class Engine {
  constructor({ grids, update, updateCell, scanOrder = "ltr" }) {
    this.grids = grids.map(g => ({ ...g, nextGrid: g.grid.clone() }));
    this.update = update;
    this.updateCell = updateCell;

    this.scanOrder = scanOrder;

    this.running = false;
    this.fps = 0;
    this._fpsSmoothing = 0.9;

    this.frameCounter = 0;
    this.coords = [];

    this.coords = new Uint32Array(this.grids[0].grid.width * this.grids[0].grid.height * 2);
    let k = 0;
    for (let y = 0; y < this.grids[0].grid.height; y++) {
      for (let x = 0; x < this.grids[0].grid.width; x++) {
        this.coords[k++] = x;
        this.coords[k++] = y;
      }
    }
  }

  start(renderer) {
    this.running = true;
    let last = performance.now();

    const loop = (time) => {
      if (!this.running) return;

      const dt = time - last;
      last = time;

      const currentFps = 1000 / dt;
      this.fps = this.fps * this._fpsSmoothing + currentFps * (1 - this._fpsSmoothing);

      for (let i = 0; i < this.grids.length; i++) {
        if (this.grids[i].updateCell) {
          this.grids[i].nextGrid.clear();
        }
      }

      const width = this.grids[0].grid.width;
      const height = this.grids[0].grid.height;

      let effectiveOrder = this.scanOrder;
      if (effectiveOrder === "random") {
        effectiveOrder = Math.random() < 0.5 ? "ltr" : "rtl";
      }

      if (effectiveOrder === "ltr") {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            this.updateAllGrids(x, y, dt);
          }
        }
      } else if (effectiveOrder === "rtl") {
        for (let y = 0; y < height; y++) {
          for (let x = width - 1; x >= 0; x--) {
            this.updateAllGrids(x, y, dt);
          }
        }
      } else if (effectiveOrder === "shuffle") {
        if (this.frameCounter % 2 === 0) {
          this.shuffleCoords();
        }

        for (let i = 0; i < this.coords.length; i += 2) {
          this.updateAllGrids(this.coords[i], this.coords[i + 1], dt);
        }
      } else if (effectiveOrder === "checkerboard") {
        for (let i = 0; i < 2; i++) {
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              if ((x + y) % 2 === i) {
                this.updateAllGrids(x, y, dt);
              }
            }
          }
        }
      }

      for (let i = 0; i < this.grids.length; i++) {
        const g = this.grids[i];
        if (g.updateCell) {
          [g.grid, g.nextGrid] = [g.nextGrid, g.grid];
        }
      }

      for (let i = 0; i < this.grids.length; i++) {
        const g = this.grids[i];
        if (g.update) g.update(g.grid, dt, this.grids);
      }

      renderer.drawAll(this.grids);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  shuffleCoords() {
    const coords = this.coords;
    const len = coords.length / 2;

    for (let i = len - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      const xi = coords[i * 2], yi = coords[i * 2 + 1];
      coords[i * 2] = coords[j * 2];
      coords[i * 2 + 1] = coords[j * 2 + 1];
      coords[j * 2] = xi;
      coords[j * 2 + 1] = yi;
    }
  }

  updateAllGrids(x, y, dt) {
    for (let j = 0; j < this.grids.length; j++) {
      const g = this.grids[j];
      if (g.updateCell) {
        g.updateCell(g.grid, g.nextGrid, x, y, dt, this.grids, this);
      }
    }
  }

  updateCell(x, y, dt) {
    for (let i = 0; i < this.grids.length; i++) {
      const g = this.grids[i];
      if (g.updateCell) {
        g.updateCell(g.grid, g.nextGrid, x, y, dt, this.grids, this);
      }
    }
  }

  updateGridCell(gridIndex, x, y, dt) {
    const g = this.grids[gridIndex];
    if (g.updateCell) {
      g.updateCell(g.grid, g.nextGrid, x, y, dt, this.grids, this);
    }
  }

  stop() {
    this.running = false;
  }
}