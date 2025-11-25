/**
 * Multi-segment arrows with optional start/end arrowheads
 * 
 * Arrow direction follows cell order:
 * 
 *   [{col:0,row:0}, {col:10,row:0}, {col:10,row:3}]
 *        ↓              ↓              ↓
 *      start      →   right      →   down
 * 
 *   End arrow:              Start arrow:           Both arrows:
 *   ──────────┐             ◀─────────┐            ◀─────────┐
 *             │                       │                      │
 *             ▼                       │                      ▼
 */

import { RenderedShape, GridCell, rendered } from './types';
import { line, arrow, LinearDirection } from './shapes';
import { polyline } from './polyline';

const HORIZONTAL = '─';
const ARROW_UP = '▲';
const ARROW_DOWN = '▼';
const ARROW_LEFT = '◀';
const ARROW_RIGHT = '▶';

export function polyarrow(
  cells: GridCell[],
  startArrow: boolean = false,
  endArrow: boolean = true
): RenderedShape {
  if (cells.length < 2) {
    return rendered([''], 0, 0);
  }
  
  // Single segment
  if (cells.length === 2) {
    const dCol = cells[1].col - cells[0].col;
    const dRow = cells[1].row - cells[0].row;
    const horizontal = Math.abs(dCol) > Math.abs(dRow);
    const len = horizontal ? Math.abs(dCol) : Math.abs(dRow);
    
    if (startArrow && endArrow) {
      // Double-headed arrow
      const dir = getDirection(dCol, dRow);
      const body = line(len - 2, horizontal);
      const startHead = getArrowhead(dir, true);
      const endHead = getArrowhead(dir, false);
      
      if (horizontal) {
        return rendered([startHead + body.rows[0] + endHead], len, 1);
      } else {
        return rendered([startHead, ...body.rows, endHead], 1, len);
      }
    } else if (endArrow) {
      const dir = getDirection(dCol, dRow);
      return arrow(len, dir);
    } else if (startArrow) {
      const dir = getDirection(-dCol, -dRow);
      return arrow(len, dir);
    }
    
    return line(len, horizontal);
  }
  
  return buildPolyarrow(cells, startArrow, endArrow);
}

/**
 * Build multi-segment arrow with arrowheads
 * 
 * Direction logic:
 * 
 *   Cells: [A, B, C]
 *           ↓  ↓  ↓
 *   
 *   Start arrow at A:
 *     - Look at segment A→B
 *     - If A→B goes right (dCol>0), arrow points left: ◀
 *     - If A→B goes down (dRow>0), arrow points up: ▲
 *   
 *   End arrow at C:
 *     - Look at segment B→C
 *     - If B→C goes right (dCol>0), arrow points right: ▶
 *     - If B→C goes down (dRow>0), arrow points down: ▼
 * 
 *   Example L-shape: [{col:0,row:0}, {col:10,row:0}, {col:10,row:3}]
 *     
 *     Start: A→B is right, so ◀     End: B→C is down, so ▼
 *     
 *     ◀─────────┐
 *               │
 *               ▼
 */
function buildPolyarrow(
  cells: GridCell[],
  startArrow: boolean,
  endArrow: boolean
): RenderedShape {
  // Build base polyline
  const base = polyline(cells);
  const grid = base.rows.map(row => row.split(''));
  
  const minCol = Math.min(...cells.map(c => c.col));
  const minRow = Math.min(...cells.map(c => c.row));
  
  // Add arrowheads
  if (startArrow) {
    // Start arrow points opposite to first segment direction
    // Example: if first segment goes right (→), arrow points left (◀)
    const dCol = cells[1].col - cells[0].col;  // Delta from cell[0] to cell[1]
    const dRow = cells[1].row - cells[0].row;
    const dir = getDirection(dCol, dRow);      // Get segment direction (e.g., Right)
    const head = getArrowhead(dir, true);      // Reverse it (Right → Left = ◀)
    const col = cells[0].col - minCol;
    const row = cells[0].row - minRow;
    grid[row][col] = head;
  }
  
  if (endArrow) {
    // End arrow points in last segment direction
    // Example: if last segment goes down (↓), arrow points down (▼)
    const lastIdx = cells.length - 1;
    const dCol = cells[lastIdx].col - cells[lastIdx - 1].col;  // Delta from second-to-last to last
    const dRow = cells[lastIdx].row - cells[lastIdx - 1].row;
    const dir = getDirection(dCol, dRow);      // Get segment direction (e.g., Down)
    const head = getArrowhead(dir, false);     // Use as-is (Down = ▼)
    const col = cells[lastIdx].col - minCol;
    const row = cells[lastIdx].row - minRow;
    grid[row][col] = head;
  }
  
  return rendered(grid.map(row => row.join('')), base.width, base.height);
}

function getDirection(dCol: number, dRow: number): LinearDirection {
  const horizontal = Math.abs(dCol) > Math.abs(dRow);
  
  if (horizontal) {
    return dCol > 0 ? LinearDirection.Right : LinearDirection.Left;
  } else {
    return dRow > 0 ? LinearDirection.Down : LinearDirection.Up;
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
