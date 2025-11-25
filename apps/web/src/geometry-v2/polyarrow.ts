/**
 * Multi-segment arrows with optional start/end arrowheads
 * 
 * Arrow direction follows point order:
 * 
 *   [{x:0,y:0}, {x:130,y:0}, {x:130,y:60}]
 *        ↓          ↓            ↓
 *      start   →  right    →   down
 * 
 *   End arrow:              Start arrow:           Both arrows:
 *   ──────────┐             ◀─────────┐            ◀─────────┐
 *             │                       │                      │
 *             ▼                       │                      ▼
 */

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

/**
 * Build multi-segment arrow with arrowheads
 * 
 * Direction logic:
 * 
 *   Points: [A, B, C]
 *            ↓  ↓  ↓
 *   
 *   Start arrow at A:
 *     - Look at segment A→B
 *     - If A→B goes right (dx>0), arrow points left: ◀
 *     - If A→B goes down (dy>0), arrow points up: ▲
 *   
 *   End arrow at C:
 *     - Look at segment B→C
 *     - If B→C goes right (dx>0), arrow points right: ▶
 *     - If B→C goes down (dy>0), arrow points down: ▼
 * 
 *   Example L-shape: [{x:0,y:0}, {x:130,y:0}, {x:130,y:60}]
 *     
 *     Start: A→B is right, so ◀     End: B→C is down, so ▼
 *     
 *     ◀─────────┐
 *               │
 *               ▼
 */
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
    // Start arrow points opposite to first segment direction
    // Example: if first segment goes right (→), arrow points left (◀)
    const dx = points[1].x - points[0].x;  // Delta from point[0] to point[1]
    const dy = points[1].y - points[0].y;
    const dir = getDirection(dx, dy);      // Get segment direction (e.g., Right)
    const head = getArrowhead(dir, true);  // Reverse it (Right → Left = ◀)
    const gridX = Math.floor((points[0].x - minX) / X_SCALE);
    const gridY = Math.floor((points[0].y - minY) / Y_SCALE);
    grid[gridY][gridX] = head;
  }
  
  if (endArrow) {
    // End arrow points in last segment direction
    // Example: if last segment goes down (↓), arrow points down (▼)
    const lastIdx = points.length - 1;
    const dx = points[lastIdx].x - points[lastIdx - 1].x;  // Delta from second-to-last to last
    const dy = points[lastIdx].y - points[lastIdx - 1].y;
    const dir = getDirection(dx, dy);      // Get segment direction (e.g., Down)
    const head = getArrowhead(dir, false); // Use as-is (Down = ▼)
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
