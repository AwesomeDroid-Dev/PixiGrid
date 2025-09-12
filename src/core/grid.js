export class Grid {
  constructor(width, height, StorageType = Uint8Array) {
    this.width = width;
    this.height = height;
    this.data = new StorageType(width * height);
    this.storageType = StorageType;
  }

  index(x, y) {
    return y * this.width + x;
  }

  get(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return -1; // out of bounds = -1
    }
    return this.data[this.index(x, y)];
  }

  set(x, y, value) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.data[this.index(x, y)] = value;
  }

  clear() {
    this.data.fill(0); // fast reset
  }

  clone() {
    const copy = new Grid(this.width, this.height, this.storageType);
    copy.data.set(this.data); // copy underlying data
    return copy;
  }
}