/**
 * Grid class for storing and manipulating 2D grid data
 */
export class Grid {
  /**
   * Create a new grid
   * @param {number} width - Width of the grid
   * @param {number} height - Height of the grid
   * @param {TypedArray} StorageType - Type of storage array (default: Uint8Array)
   */
  constructor(width, height, StorageType = Uint8Array) {
    this.width = width;
    this.height = height;
    this.data = new StorageType(width * height);
    this.storageType = StorageType;
  }

  /**
   * Calculate index from x, y coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Index in the data array
   */
  index(x, y) {
    return y * this.width + x;
  }

  /**
   * Get value at coordinates with bounds checking
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Value at coordinates or -1 if out of bounds
   */
  get(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return -1; // out of bounds = -1
    }
    return this.data[this.index(x, y)];
  }

  /**
   * Direct access to data without bounds checking for performance
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Value at coordinates
   */
  getDirect(x, y) {
    return this.data[this.index(x, y)];
  }

  /**
   * Set value at coordinates with bounds checking
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} value - Value to set
   */
  set(x, y, value) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.data[this.index(x, y)] = value;
  }

  /**
   * Directly set value without bounds checking for performance
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} value - Value to set
   */
  setDirect(x, y, value) {
    this.data[this.index(x, y)] = value;
  }

  /**
   * Clear the grid (fill with zeros)
   */
  clear() {
    this.data.fill(0); // fast reset
  }

  /**
   * Create a clone of the grid
   * @returns {Grid} A new grid with the same data
   */
  clone() {
    const copy = new Grid(this.width, this.height, this.storageType);
    copy.data.set(this.data); // copy underlying data
    return copy;
  }
}