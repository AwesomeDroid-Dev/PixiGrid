# PixiGrid

PixiGrid is a lightweight JavaScript library for creating pixel-based grid interactive applications such as drawing tools, cellular automata simulations, and grid-based games. It provides a modular architecture with components for grid management, rendering, camera controls, and simulation engine.

<img width="1305" height="722" alt="Screenshot 2025-10-01 064607" src="https://github.com/user-attachments/assets/1e1742db-f33b-487a-94d0-d5e42423dd94" />

## Features

- **Grid System**: Efficient 2D grid data structure with multiple storage types (Uint8Array, Int16Array, etc.)
- **Rendering Engine**: High-performance canvas-based renderer with support for multiple layers
- **Camera Controls**: Pan and zoom functionality for navigating large grids
- **Simulation Engine**: Flexible engine for updating grid cells with various scanning algorithms
- **Event Handling**: Built-in support for mouse and touch interactions
- **Layered Rendering**: Support for multiple grid layers with alpha blending
- **Performance Optimized**: Direct data access methods and efficient rendering pipeline

## To-Do

 - **Event System**: Just a simple event system for handling mouse and touch interactions. It should make implementing faster and more compact, as well as more visually appealing.
 - **Dirty Rendering**: Only render cells that have changed since the last frame.
 - **Mult-Threading**: Implementing this would be great especially for grids that update more often than they are being rendered.
 - **Built-In Dirty Updating**: Could be done using available features right now, but would be better if it was built in.
 - **Refactoring Large Classes**: Needs to be done, since the code files are getting quite large.
 - **Adding React Examples**: It would be great to see more examples of how to use PixiGrid.

## Installation

As a client-side library, Pixel Canvas JS can be used directly in the browser without installation. Simply include the source files in your project.

### Using npm for local development server

```bash
npm install
npm start
```

This will start a local development server using [serve](https://www.npmjs.com/package/serve) to run the examples.

## Core Components

### Grid

The [Grid](./src/core/grid.js) class represents a 2D grid for storing and manipulating data:

```javascript
import { Grid } from './src/core/grid.js';

// Create a 200x100 grid using Uint8Array for storage
const grid = new Grid(200, 100);

// Set values
grid.set(10, 5, 1); // Set cell at (10, 5) to value 1

// Get values
const value = grid.get(10, 5); // Returns 1

// Clear grid
grid.clear(); // Fill with zeros

// Clone grid
const copy = grid.clone();
```

### Renderer

The [Renderer](./src/core/renderer.js) class handles drawing grids to a canvas element:

```javascript
import { Renderer } from './src/core/renderer.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const renderer = new Renderer(ctx, grid, {
  dataToColor: (value) => {
    // Map values to colors
    switch(value) {
      case 0: return [255, 255, 255, 255]; // White
      case 1: return [0, 0, 0, 255];       // Black
      default: return [255, 255, 255, 0];  // Transparent
    }
  },
  outOfBoundsColor: "lightgray",
  gridBackgroundColor: "white"
});
```

### Camera

The [Camera](./src/core/camera.js) class provides pan and zoom functionality:

```javascript
import { Camera } from './src/core/camera.js';

const camera = new Camera(0, 0, 1); // x, y, zoom

// Move camera
camera.translate(10, 5); // Move by (10, 5)

// Zoom at center point
camera.setZoom(1.5, centerX, centerY);

// Convert between world and screen coordinates
const screenPos = camera.worldToScreen(worldX, worldY);
const worldPos = camera.screenToWorld(screenX, screenY);
```

### Engine

The [Engine](./src/core/engine.js) class provides a simulation loop for updating grid cells:

```javascript
import { Engine } from './src/core/engine.js';

const engine = new Engine({
  grids: [{ grid, updateCell }],
  scanOrder: "ltr" // left-to-right, other options: "rtl", "shuffle", "checkerboard"
});

// Start simulation
engine.start(renderer);

// Stop simulation
engine.stop();

function updateCell(grid, nextGrid, x, y, dt, grids, engine) {
  // Update logic for each cell
  const currentValue = grid.get(x, y);
  nextGrid.set(x, y, calculateNextState(currentValue));
}
```

## Examples

The library includes two complete examples demonstrating different use cases:

### Paint Demo ([examples/vanilla/paint.html](./examples/vanilla/paint.html))

A simple pixel art painting application with:
- Multiple color selection
- Brush size adjustment
- Pan and zoom functionality
- Touch support

### Sand Demo ([examples/vanilla/sand.html](./examples/vanilla/sand.html))

A falling sand simulation demonstrating:
- Cellular automata physics
- Real-time simulation updates
- Multi-layer rendering

To run the examples, start the development server with `npm start` and navigate to:
- http://localhost:3000/examples/vanilla/paint.html
- http://localhost:3000/examples/vanilla/sand.html

## API Overview

### Grid API

| Method | Description |
|--------|-------------|
| `constructor(width, height, StorageType)` | Create a new grid |
| `get(x, y)` | Get value at position with bounds checking |
| `set(x, y, value)` | Set value at position with bounds checking |
| `getDirect(x, y)` | Get value without bounds checking (faster) |
| `setDirect(x, y, value)` | Set value without bounds checking (faster) |
| `clear()` | Fill grid with zeros |
| `clone()` | Create a copy of the grid |

### Camera API

| Method | Description |
|--------|-------------|
| `constructor(x, y, zoom)` | Create a new camera |
| `translate(dx, dy)` | Move camera by offset |
| `setPosition(x, y)` | Set camera position |
| `setZoom(factor, centerX, centerY)` | Zoom relative to a center point |
| `worldToScreen(wx, wy)` | Convert world to screen coordinates |
| `screenToWorld(sx, sy)` | Convert screen to world coordinates |

### Renderer API

| Method | Description |
|--------|-------------|
| `constructor(ctx, grid, options)` | Create a new renderer |
| `draw(grid, options)` | Draw a single grid |
| `drawAll(grids)` | Draw multiple grids with layer blending |

### Engine API

| Method | Description |
|--------|-------------|
| `constructor(options)` | Create a new engine |
| `start(renderer)` | Start the simulation loop |
| `stop()` | Stop the simulation loop |
| `updateCell(x, y, dt)` | Manually update a cell |

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

Possible areas for improvement:
- Additional rendering effects
- More built-in simulation patterns
- Performance optimizations
- Additional examples

## License

This project is open source and it currently isn't licensed, so you can use it freely.
