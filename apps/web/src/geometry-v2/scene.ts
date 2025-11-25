/**
 * Scene Building
 * 
 * Combines multiple positioned shapes into a single scene grid.
 * 
 * Input:                          Output Scene:
 *   [{                              ┌─────┐       ┌─────┐
 *     rows: ['┌─────┐',             │ Box │ ────▶ │ Box │
 *            '│ Box │',             └─────┘       └─────┘
 *            '└─────┘'],
 *     position: {x:0, y:0}
 *   },
 *   {
 *     rows: ['────▶'],
 *     position: {x:104, y:20}
 *   },
 *   {
 *     rows: ['┌─────┐',
 *            '│ Box │',
 *            '└─────┘'],
 *     position: {x:182, y:0}
 *   }]
 */

import { RenderedRows, PositionedRows, Scene, Point } from './types';
import { X_SCALE, Y_SCALE, pixelsToGridWidth, pixelsToGridHeight } from './scale';

/**
 * Build a scene by merging multiple positioned rows into a single grid
 */
export function buildScene(positionedRows: PositionedRows[]): Scene {
  if (positionedRows.length === 0) {
    return { origin: { x: 0, y: 0 }, content: [[]] };
  }

  // Calculate scene bounds
  const minX = Math.min(...positionedRows.map(pr => pr.position.x));
  const minY = Math.min(...positionedRows.map(pr => pr.position.y));
  
  const maxX = Math.max(...positionedRows.map(pr => {
    const width = Math.max(0, ...pr.rows.map(row => row.length));
    return pr.position.x + width * X_SCALE;
  }));
  
  const maxY = Math.max(...positionedRows.map(pr => {
    return pr.position.y + pr.rows.length * Y_SCALE;
  }));

  const width = pixelsToGridWidth(maxX - minX);
  const height = pixelsToGridHeight(maxY - minY);

  // Create empty grid
  const grid: string[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(' '));

  // Write each positioned rows to grid
  positionedRows.forEach(pr => {
    writeToGrid(grid, pr.rows, pr.position, { x: minX, y: minY });
  });

  return {
    origin: { x: minX, y: minY },
    content: grid,
  };
}

/**
 * Write rendered rows to a grid at a specific position
 */
function writeToGrid(
  grid: string[][],
  rows: RenderedRows,
  position: Point,
  sceneOrigin: Point
): void {
  const offsetX = pixelsToGridWidth(position.x - sceneOrigin.x);
  const offsetY = pixelsToGridHeight(position.y - sceneOrigin.y);

  rows.forEach((row, rowNum) => {
    const chars = row.split('');
    chars.forEach((char, colNum) => {
      if (char !== ' ') {
        const gridY = rowNum + offsetY;
        const gridX = colNum + offsetX;
        
        // Bounds check
        if (gridY >= 0 && gridY < grid.length &&
            gridX >= 0 && gridX < grid[0].length) {
          grid[gridY][gridX] = char;
        }
      }
    });
  });
}
