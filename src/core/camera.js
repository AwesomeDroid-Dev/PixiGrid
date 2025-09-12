export class Camera {
  constructor(x = 0, y = 0, zoom = 1) {
    this.x = x;
    this.y = y;
    this.zoom = zoom;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setZoom(factor, worldX, worldY) {
    const newZoom = Math.max(0.1, Math.min(20, this.zoom * factor));

    this.x = worldX - (worldX - this.x) * (newZoom / this.zoom);
    this.y = worldY - (worldY - this.y) * (newZoom / this.zoom);

    this.zoom = newZoom;
  }

  resetZoom() {
    this.zoom = 1;
    this.x = 0;
    this.y = 0;
  }

  worldToScreen(wx, wy) {
    return {
      sx: (wx - this.x) * this.zoom,
      sy: (wy - this.y) * this.zoom
    };
  }

  screenToWorld(sx, sy) {
    return {
      wx: sx / this.zoom + this.x,
      wy: sy / this.zoom + this.y
    };
  }

  getBounds(canvasWidth, canvasHeight) {
    return {
      left: this.x,
      top: this.y,
      right: this.x + canvasWidth / this.zoom,
      bottom: this.y + canvasHeight / this.zoom
    };
  }

  centerOn(wx, wy, canvasWidth, canvasHeight) {
    this.x = wx - (canvasWidth / this.zoom) / 2;
    this.y = wy - (canvasHeight / this.zoom) / 2;
  }
}