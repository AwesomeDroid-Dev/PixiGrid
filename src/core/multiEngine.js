export class MultiEngine {
  constructor({ grids, update, updateCell }) {
    this.grids = grids.map(g => ({ ...g, nextGrid: g.grid.clone() }));
    this.update = update;
    this.updateCell = updateCell;

    this.running = false;
    this.fps = 0;
    this._fpsSmoothing = 0.9;
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

      for (let y = 0; y < this.grids[0].grid.height; y++) {
        for (let x = 0; x < this.grids[0].grid.width; x++) {
          for (let i = 0; i < this.grids.length; i++) {
            const g = this.grids[i];
            if (g.updateCell) {
              g.updateCell(g.grid, g.nextGrid, x, y, dt, this.grids);
            }
          }
        }
      }

      for (let i = 0; i < this.grids.length; i++) {
        const g = this.grids[i];
        if (g.update) g.update(g.nextGrid, dt);
      }

      for (let i = 0; i < this.grids.length; i++) {
        const g = this.grids[i];
        if (g.updateCell) {
          [g.grid, g.nextGrid] = [g.nextGrid, g.grid];
        }
      }

      renderer.drawAll(this.grids);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }
}