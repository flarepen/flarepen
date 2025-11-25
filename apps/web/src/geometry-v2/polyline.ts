import { RenderedRows, Point } from './types';
import { pointToGrid, pixelDeltaToGridWidth, pixelDeltaToGridHeight, isHorizontalMovement } from './scale';
import { line } from './shapes';
import { boundsOfPoints } from './bounds';

const HORIZONTAL = '─';
const VERTICAL = '│';

export function polyline(points: Point[]): RenderedRows {
  if (points.length < 2) return [''];
  
  // Single segment - use line function
  if (points.length === 2) {
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const horizontal = isHorizontalMovement(dx, dy);
    const len = Math.floor(horizontal ? pixelDeltaToGridWidth(dx) : pixelDeltaToGridHeight(dy));
    return line(len, horizontal);
  }
  
  return buildPolyline(points);
}

export function buildPolyline(points: Point[]): RenderedRows {
  const bounds = boundsOfPoints(points);
  const grid = createEmptyGrid(bounds.width, bounds.height);
  
  drawSegments(grid, points, bounds.origin);
  placeCorners(grid, points, bounds.origin);
  
  return gridToRows(grid);
}

function createEmptyGrid(width: number, height: number): string[][] {
  return Array(height).fill(null).map(() => Array(width).fill(' '));
}

function drawSegments(grid: string[][], points: Point[], origin: Point): void {
  for (let i = 0; i < points.length - 1; i++) {
    drawSegment(grid, points[i], points[i + 1], origin);
  }
}

function drawSegment(grid: string[][], p1: Point, p2: Point, origin: Point): void {
  const { x: x1, y: y1 } = pointToGrid(p1, origin);
  const { x: x2, y: y2 } = pointToGrid(p2, origin);
  
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  
  // Draw line segment with tolerance (snap to dominant direction)
  if (dx <= 1 && dy > 0) {
    // Vertical or near-vertical
    drawVerticalLine(grid, x1, Math.min(y1, y2), Math.max(y1, y2));
  } else if (dy <= 1 && dx > 0) {
    // Horizontal or near-horizontal
    drawHorizontalLine(grid, y1, Math.min(x1, x2), Math.max(x1, x2));
  }
}

function drawVerticalLine(grid: string[][], x: number, startY: number, endY: number): void {
  for (let y = startY; y <= endY; y++) {
    grid[y][x] = VERTICAL;
  }
}

function drawHorizontalLine(grid: string[][], y: number, startX: number, endX: number): void {
  for (let x = startX; x <= endX; x++) {
    grid[y][x] = HORIZONTAL;
  }
}

function placeCorners(grid: string[][], points: Point[], origin: Point): void {
  for (let i = 1; i < points.length - 1; i++) {
    const corner = getCornerChar(points[i - 1], points[i], points[i + 1]);
    const { x, y } = pointToGrid(points[i], origin);
    grid[y][x] = corner;
  }
}

function gridToRows(grid: string[][]): RenderedRows {
  return grid.map(row => row.join(''));
}

function getCornerChar(prev: Point, current: Point, next: Point): string {
  const fromDx = current.x - prev.x;
  const fromDy = current.y - prev.y;
  const toDx = next.x - current.x;
  const toDy = next.y - current.y;
  
  // Determine directions
  const fromRight = fromDx > 0;
  const fromLeft = fromDx < 0;
  const fromDown = fromDy > 0;
  const fromUp = fromDy < 0;
  
  const toRight = toDx > 0;
  const toLeft = toDx < 0;
  const toDown = toDy > 0;
  const toUp = toDy < 0;
  
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
