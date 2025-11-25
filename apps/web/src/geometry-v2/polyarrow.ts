import { RenderedRows, Point } from './types';
import { X_SCALE, Y_SCALE } from './scale';
import { line, arrow, LinearDirection } from './shapes';
import { buildPolyline } from './polyline';

const HORIZONTAL = '─';
const ARROW_UP = '▲';
const ARROW_DOWN = '▼';
const ARROW_LEFT = '◀';
const ARROW_RIGHT = '▶';

export function polyarrow(
  points: Point[],
  startArrow: boolean = false,
  endArrow: boolean = true
): RenderedRows {
  if (points.length < 2) return [''];
  
  // Single segment - use arrow function
  if (points.length === 2) {
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const len = Math.floor(horizontal ? Math.abs(dx) / X_SCALE : Math.abs(dy) / Y_SCALE);
    
    if (startArrow && endArrow) {
      // Double-headed arrow
      const dir = getDirection(dx, dy);
      const body = line(len - 2, horizontal);
      const startHead = getArrowhead(dir, true);
      const endHead = getArrowhead(dir, false);
      
      if (horizontal) {
        return [startHead + body[0] + endHead];
      } else {
        return [startHead, ...body, endHead];
      }
    } else if (endArrow) {
      const dir = getDirection(dx, dy);
      return arrow(len, dir);
    } else if (startArrow) {
      const dir = getDirection(-dx, -dy);
      return arrow(len, dir);
    }
    
    return line(len, horizontal);
  }
  
  return buildPolyarrow(points, startArrow, endArrow);
}

function buildPolyarrow(
  points: Point[],
  startArrow: boolean,
  endArrow: boolean
): RenderedRows {
  // Build base polyline
  const rows = buildPolyline(points);
  const grid = rows.map(row => row.split(''));
  
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  
  // Add arrowheads
  if (startArrow) {
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const dir = getDirection(dx, dy);
    const head = getArrowhead(dir, true);
    const gridX = Math.floor((points[0].x - minX) / X_SCALE);
    const gridY = Math.floor((points[0].y - minY) / Y_SCALE);
    grid[gridY][gridX] = head;
  }
  
  if (endArrow) {
    const lastIdx = points.length - 1;
    const dx = points[lastIdx].x - points[lastIdx - 1].x;
    const dy = points[lastIdx].y - points[lastIdx - 1].y;
    const dir = getDirection(dx, dy);
    const head = getArrowhead(dir, false);
    const gridX = Math.floor((points[lastIdx].x - minX) / X_SCALE);
    const gridY = Math.floor((points[lastIdx].y - minY) / Y_SCALE);
    grid[gridY][gridX] = head;
  }
  
  return grid.map(row => row.join(''));
}

function getDirection(dx: number, dy: number): LinearDirection {
  const horizontal = Math.abs(dx) > Math.abs(dy);
  
  if (horizontal) {
    return dx > 0 ? LinearDirection.Right : LinearDirection.Left;
  } else {
    return dy > 0 ? LinearDirection.Down : LinearDirection.Up;
  }
}

function getArrowhead(dir: LinearDirection, reverse: boolean): string {
  if (reverse) {
    switch (dir) {
      case LinearDirection.Right: return ARROW_LEFT;
      case LinearDirection.Left: return ARROW_RIGHT;
      case LinearDirection.Down: return ARROW_UP;
      case LinearDirection.Up: return ARROW_DOWN;
      default: return HORIZONTAL;
    }
  }
  
  switch (dir) {
    case LinearDirection.Right: return ARROW_RIGHT;
    case LinearDirection.Left: return ARROW_LEFT;
    case LinearDirection.Down: return ARROW_DOWN;
    case LinearDirection.Up: return ARROW_UP;
    default: return HORIZONTAL;
  }
}
