import { RenderedShape, GridCell, rendered } from './types';
import { line } from './shapes';
import { boundsOfCells } from './bounds';

const HORIZONTAL = '─';
const VERTICAL = '│';

/**
 * Create a polyline from grid cell positions
 */
export function polyline(cells: GridCell[]): RenderedShape {
  if (cells.length < 2) {
    return rendered([''], 0, 0);
  }
  
  // Single segment - use line function
  if (cells.length === 2) {
    const dCol = Math.abs(cells[1].col - cells[0].col);
    const dRow = Math.abs(cells[1].row - cells[0].row);
    const horizontal = dCol > dRow;
    const len = horizontal ? dCol : dRow;
    return line(len, horizontal);
  }
  
  return buildPolyline(cells);
}

function buildPolyline(cells: GridCell[]): RenderedShape {
  const bounds = boundsOfCells(cells);
  const grid = createEmptyGrid(bounds.width, bounds.height);
  
  drawSegments(grid, cells, bounds.origin);
  placeCorners(grid, cells, bounds.origin);
  
  return rendered(gridToRows(grid), bounds.width, bounds.height);
}

function createEmptyGrid(width: number, height: number): string[][] {
  return Array(height).fill(null).map(() => Array(width).fill(' '));
}

function drawSegments(grid: string[][], cells: GridCell[], origin: GridCell): void {
  for (let i = 0; i < cells.length - 1; i++) {
    drawSegment(grid, cells[i], cells[i + 1], origin);
  }
}

function drawSegment(grid: string[][], c1: GridCell, c2: GridCell, origin: GridCell): void {
  const col1 = c1.col - origin.col;
  const row1 = c1.row - origin.row;
  const col2 = c2.col - origin.col;
  const row2 = c2.row - origin.row;
  
  const dCol = Math.abs(col2 - col1);
  const dRow = Math.abs(row2 - row1);
  
  // Draw line segment
  if (dCol === 0 && dRow > 0) {
    // Vertical
    drawVerticalLine(grid, col1, Math.min(row1, row2), Math.max(row1, row2));
  } else if (dRow === 0 && dCol > 0) {
    // Horizontal
    drawHorizontalLine(grid, row1, Math.min(col1, col2), Math.max(col1, col2));
  }
}

function drawVerticalLine(grid: string[][], col: number, startRow: number, endRow: number): void {
  for (let row = startRow; row <= endRow; row++) {
    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      grid[row][col] = VERTICAL;
    }
  }
}

function drawHorizontalLine(grid: string[][], row: number, startCol: number, endCol: number): void {
  for (let col = startCol; col <= endCol; col++) {
    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      grid[row][col] = HORIZONTAL;
    }
  }
}

function placeCorners(grid: string[][], cells: GridCell[], origin: GridCell): void {
  for (let i = 1; i < cells.length - 1; i++) {
    const corner = getCornerChar(cells[i - 1], cells[i], cells[i + 1]);
    const col = cells[i].col - origin.col;
    const row = cells[i].row - origin.row;
    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      grid[row][col] = corner;
    }
  }
}

function gridToRows(grid: string[][]): string[] {
  return grid.map(row => row.join(''));
}

function getCornerChar(prev: GridCell, current: GridCell, next: GridCell): string {
  const fromDCol = current.col - prev.col;
  const fromDRow = current.row - prev.row;
  const toDCol = next.col - current.col;
  const toDRow = next.row - current.row;
  
  // Determine directions
  const fromRight = fromDCol > 0;
  const fromLeft = fromDCol < 0;
  const fromDown = fromDRow > 0;
  const fromUp = fromDRow < 0;
  
  const toRight = toDCol > 0;
  const toLeft = toDCol < 0;
  const toDown = toDRow > 0;
  const toUp = toDRow < 0;
  
  // Return appropriate corner
  if (fromLeft && toDown) return '┐';
  if (fromUp && toRight) return '└';
  if (fromRight && toUp) return '┘';
  if (fromDown && toLeft) return '┌';
  
  if (fromRight && toDown) return '┐';
  if (fromDown && toRight) return '└';
  if (fromLeft && toUp) return '┘';
  if (fromUp && toLeft) return '┌';
  
  return HORIZONTAL; // Fallback
}
