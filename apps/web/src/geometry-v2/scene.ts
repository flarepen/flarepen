/**
 * Scene Building
 * 
 * Combines multiple positioned shapes into a single scene grid.
 * Works entirely in grid coordinates - no pixel conversion.
 * 
 * Input:                          Output Scene:
 *   [{                              ┌─────┐       ┌─────┐
 *     shape: {                      │ Box │ ────▶ │ Box │
 *       rows: ['┌─────┐',           └─────┘       └─────┘
 *              '│ Box │',
 *              '└─────┘'],
 *       width: 7,
 *       height: 3
 *     },
 *     position: {col:0, row:0}
 *   },
 *   {
 *     shape: {
 *       rows: ['────▶'],
 *       width: 5,
 *       height: 1
 *     },
 *     position: {col:8, row:1}
 *   },
 *   {
 *     shape: {
 *       rows: ['┌─────┐',
 *              '│ Box │',
 *              '└─────┘'],
 *       width: 7,
 *       height: 3
 *     },
 *     position: {col:14, row:0}
 *   }]
 */

import { RenderedShape, PositionedShape, Scene, GridCell } from './types';
import { boundsOfPositionedShapes } from './bounds';

/**
 * Build a scene by merging multiple positioned shapes into a single grid
 */
export function buildScene(shapes: PositionedShape[]): Scene {
  if (shapes.length === 0) {
    return { origin: { col: 0, row: 0 }, content: [[]] };
  }

  const bounds = boundsOfPositionedShapes(shapes);

  // Create empty grid
  const grid: string[][] = Array(bounds.height)
    .fill(null)
    .map(() => Array(bounds.width).fill(' '));

  // Write each shape to grid
  shapes.forEach(ps => {
    writeToGrid(grid, ps.shape, ps.position, bounds.origin);
  });

  return {
    origin: bounds.origin,
    content: grid,
  };
}

/**
 * Write rendered shape to a grid at a specific position
 */
function writeToGrid(
  grid: string[][],
  shape: RenderedShape,
  position: GridCell,
  sceneOrigin: GridCell
): void {
  const offsetCol = position.col - sceneOrigin.col;
  const offsetRow = position.row - sceneOrigin.row;

  shape.rows.forEach((row, rowNum) => {
    const chars = row.split('');
    chars.forEach((char, colNum) => {
      if (char !== ' ') {
        const gridRow = rowNum + offsetRow;
        const gridCol = colNum + offsetCol;
        
        // Bounds check
        if (gridRow >= 0 && gridRow < grid.length &&
            gridCol >= 0 && gridCol < grid[0].length) {
          grid[gridRow][gridCol] = char;
        }
      }
    });
  });
}
