import { RenderedRows, Point } from './types';
import { X_SCALE, Y_SCALE } from './scale';
import { line } from './shapes';

const HORIZONTAL = '─';
const VERTICAL = '│';

export function polyline(points: Point[]): RenderedRows {
  if (points.length < 2) return [''];
  
  // Single segment - use line function
  if (points.length === 2) {
    const dx = Math.abs(points[1].x - points[0].x) / X_SCALE;
    const dy = Math.abs(points[1].y - points[0].y) / Y_SCALE;
    const horizontal = dx > dy;
    const len = Math.floor(horizontal ? dx : dy);
    return line(len, horizontal);
  }
  
  return buildPolyline(points);
}

export function buildPolyline(points: Point[]): RenderedRows {
  // Calculate bounding box
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  
  const width = Math.floor((maxX - minX) / X_SCALE) + 1;
  const height = Math.floor((maxY - minY) / Y_SCALE) + 1;
  
  // Create empty grid
  const grid: string[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(' '));
  
  // Draw each segment
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    // Convert to grid coordinates (relative to minX, minY)
    const x1 = Math.floor((p1.x - minX) / X_SCALE);
    const y1 = Math.floor((p1.y - minY) / Y_SCALE);
    const x2 = Math.floor((p2.x - minX) / X_SCALE);
    const y2 = Math.floor((p2.y - minY) / Y_SCALE);
    
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    
    // Draw line segment with tolerance (snap to dominant direction)
    if (dx <= 1 && dy > 0) {
      // Vertical or near-vertical
      const x = x1;
      const startY = Math.min(y1, y2);
      const endY = Math.max(y1, y2);
      for (let y = startY; y <= endY; y++) {
        grid[y][x] = VERTICAL;
      }
    } else if (dy <= 1 && dx > 0) {
      // Horizontal or near-horizontal
      const y = y1;
      const startX = Math.min(x1, x2);
      const endX = Math.max(x1, x2);
      for (let x = startX; x <= endX; x++) {
        grid[y][x] = HORIZONTAL;
      }
    }
  }
  
  // Place corners at junction points
  for (let i = 1; i < points.length - 1; i++) {
    const corner = getCornerChar(points[i - 1], points[i], points[i + 1]);
    const gridX = Math.floor((points[i].x - minX) / X_SCALE);
    const gridY = Math.floor((points[i].y - minY) / Y_SCALE);
    grid[gridY][gridX] = corner;
  }
  
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
