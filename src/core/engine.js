export class Engine {
  constructor({ grid, update, updateCell }) {
    this.grid = grid;
    this.nextGrid = grid.clone(); // double buffer
    this.update = update;
    this.updateCell = updateCell;

    this.width = grid.width;
    this.height = grid.height;

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

      if (this.updateCell) {
        this.nextGrid.clear();
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            this.updateCell(this.grid, this.nextGrid, x, y, dt);
          }
        }
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
      }

      if (this.update) this.update(this.grid, dt);

      // Let renderer handle drawing
      renderer.draw(this.grid);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }
}