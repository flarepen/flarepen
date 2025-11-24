import {
  LinearDirection,
  Element,
  ElementType,
  IBounds,
  isHorizontal,
  point,
  Point,
  Rectangle,
} from './element';
import _ from 'lodash';
import { X_SCALE, Y_SCALE } from './constants';
import { MergedElements, BorderType } from './types';

export type Row = string;
export type Shape = Row[];

export const SYMBOLS = {
  HORIZONTAL: '─',
  VERTICAL: '│',
  ARROW_LEFT: '◀',
  ARROW_RIGHT: '▶',
  ARROW_UP: '▲',
  ARROW_DOWN: '▼',
};

export const BOX = {
  [BorderType.Normal]: {
    LEFT_TOP: '┌',
    RIGHT_TOP: '┐',
    LEFT_BOTTOM: '└',
    RIGHT_BOTTOM: '┘',
    HORIZONTAL: '─',
    VERTICAL: '│',
  },
  [BorderType.Double]: {
    LEFT_TOP: '╔',
    RIGHT_TOP: '╗',
    LEFT_BOTTOM: '╚',
    RIGHT_BOTTOM: '╝',
    HORIZONTAL: '═',
    VERTICAL: '║',
  },
  [BorderType.Heavy]: {
    LEFT_TOP: '┏',
    RIGHT_TOP: '┓',
    LEFT_BOTTOM: '┗',
    RIGHT_BOTTOM: '┛',
    HORIZONTAL: '━',
    VERTICAL: '┃',
  },
  [BorderType.Rounded]: {
    LEFT_TOP: '╭',
    RIGHT_TOP: '╮',
    LEFT_BOTTOM: '╰',
    RIGHT_BOTTOM: '╯',
    HORIZONTAL: '─',
    VERTICAL: '│',
  },
};

// TODO: Add better validations and edge case handling
export function rectangle(rectangle: Rectangle): Shape {
  let { width, height, label, borderType } = rectangle;
  width = Math.abs(width);
  height = Math.abs(height);

  const shape = [];
  const box = BOX[borderType];

  // Top
  let top = '';

  if (label) {
    top =
      box.LEFT_TOP +
      label +
      (width - label.length - 2 > 0 ? box.HORIZONTAL.repeat(width - label.length - 2) : '') +
      box.RIGHT_TOP;
  } else {
    top = box.LEFT_TOP + (width - 2 > 0 ? box.HORIZONTAL.repeat(width - 2) : '') + box.RIGHT_TOP;
  }

  shape.push(top);

  // Mids
  if (height - 2 > 0) {
    for (let i = height - 2; i > 0; i--) {
      shape.push(box.VERTICAL + (width - 2 > 0 ? ' '.repeat(width - 2) : '') + box.VERTICAL);
    }
  }

  // Bottom
  shape.push(
    box.LEFT_BOTTOM + (width - 2 > 0 ? box.HORIZONTAL.repeat(width - 2) : '') + box.RIGHT_BOTTOM
  );
  return shape;
}

export function line(len: number, horizontal: boolean): Shape {
  if (horizontal) {
    return [SYMBOLS.HORIZONTAL.repeat(len)];
  }
  return Array(len).fill(SYMBOLS.VERTICAL);
}

// Multi-segment line using points array
export function polyline(points: Point[]): Shape {
  if (points.length < 2) return [[]];
  
  // Single segment - use existing line function
  if (points.length === 2) {
    const dx = Math.abs(points[1].x - points[0].x) / X_SCALE;
    const dy = Math.abs(points[1].y - points[0].y) / Y_SCALE;
    const horizontal = dx > dy;
    const len = Math.floor(horizontal ? dx : dy);
    return line(len, horizontal);
  }
  
  // Multi-segment - calculate bounding box
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  
  const width = Math.floor((maxX - minX) / X_SCALE) + 1;
  const height = Math.floor((maxY - minY) / Y_SCALE) + 1;
  
  // Create empty grid
  const grid: string[][] = Array(height).fill(null).map(() => 
    Array(width).fill(' ')
  );
  
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
        grid[y][x] = SYMBOLS.VERTICAL;
      }
    } else if (dy <= 1 && dx > 0) {
      // Horizontal or near-horizontal
      const y = y1;
      const startX = Math.min(x1, x2);
      const endX = Math.max(x1, x2);
      for (let x = startX; x <= endX; x++) {
        grid[y][x] = SYMBOLS.HORIZONTAL;
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
  
  return SYMBOLS.HORIZONTAL; // Fallback
}

export function arrow(len: number, direction: LinearDirection): Shape {
  let shape = [];
  switch (direction) {
    case LinearDirection.Right:
      return [line(len - 1, true)[0] + SYMBOLS.ARROW_RIGHT];
    case LinearDirection.Left:
      return [SYMBOLS.ARROW_LEFT + line(len - 1, true)[0]];
    case LinearDirection.Up:
      shape = line(len - 1, false);
      shape.unshift(SYMBOLS.ARROW_UP);
      return shape;
    case LinearDirection.Down:
      shape = line(len - 1, false);
      shape.push(SYMBOLS.ARROW_DOWN);
      return shape;
    case LinearDirection.Undecided:
      return [''];
  }
}

export function text(content: string): Shape {
  return [content];
}

// TODO: Where to keep this implementation?
function getWidth(element: Element): number {
  switch (element.type) {
    case ElementType.Rectangle:
      return element.width;
    case ElementType.Line:
      // Multi-segment line - use shape width
      if ((element as any).points) {
        return Math.max(...element.shape.map(row => row.length));
      }
      return isHorizontal(element) ? element.len : 1;
    case ElementType.Arrow:
      // Multi-segment arrow - use shape width
      if ((element as any).points) {
        return Math.max(...element.shape.map(row => row.length));
      }
      return element.direction === LinearDirection.Left ||
        element.direction === LinearDirection.Right
        ? element.len
        : 1;
    case ElementType.Text:
      return element.content.length;
  }
}

function getHeight(element: Element): number {
  switch (element.type) {
    case ElementType.Rectangle:
      return element.height;
    case ElementType.Line:
      // Multi-segment line - use shape height
      if ((element as any).points) {
        return element.shape.length;
      }
      return isHorizontal(element) ? 1 : element.len;
    case ElementType.Arrow:
      // Multi-segment arrow - use shape height
      if ((element as any).points) {
        return element.shape.length;
      }
      return element.direction === LinearDirection.Up || element.direction === LinearDirection.Down
        ? element.len
        : 1;
    case ElementType.Text:
      return 1;
  }
}

function writeToScene(origin: Point, sceneArr: string[][], element: Element) {
  const offsetX = (element.x - origin.x) / X_SCALE;
  const offsetY = (element.y - origin.y) / Y_SCALE;

  const shape: string[][] = _.map(element.shape, (row) => row.split(''));

  shape.forEach((row, rowNum) => {
    row.forEach((s, colNum) => {
      s !== ' ' && (sceneArr[rowNum + offsetY][colNum + offsetX] = s);
    });
  });
}

export function getBoundingRectForBounds(bounds: IBounds[]): IBounds {
  const xMin = _.min(_.map(bounds, (bound) => bound.x)) || 0;
  const xMax = _.max(_.map(bounds, (bound) => bound.x + bound.width)) || 0;
  const yMin = _.min(_.map(bounds, (bound) => bound.y)) || 0;
  const yMax = _.max(_.map(bounds, (bound) => bound.y + bound.height)) || 0;

  let width = xMax - xMin;
  let height = yMax - yMin;

  return {
    x: xMin,
    y: yMin,
    width,
    height,
  };
}

export function getBoundingRect(elements: Element[], scaled = false): IBounds {
  const xMin = _.min(_.map(elements, (element) => element.x)) || 0;
  const xMax = _.max(_.map(elements, (element) => element.x + getWidth(element) * X_SCALE)) || 0;
  const yMin = _.min(_.map(elements, (element) => element.y)) || 0;
  const yMax = _.max(_.map(elements, (element) => element.y + getHeight(element) * Y_SCALE)) || 0;

  let width = xMax - xMin;
  let height = yMax - yMin;

  if (!scaled) {
    width = Math.floor(width / X_SCALE);
    height = Math.floor(height / Y_SCALE);
  }

  return {
    x: xMin,
    y: yMin,
    width,
    height,
  };
}

export function merge(elements: Element[]): MergedElements {
  // Find boundaries
  const bound = getBoundingRect(elements);

  // Create a 2D array
  let sceneArr: string[][] = [];
  for (let i = 0; i < bound.height; i++) {
    sceneArr.push(new Array(bound.width).fill(' '));
  }

  // Fill the array
  elements.forEach((element) => {
    writeToScene(point(bound.x, bound.y), sceneArr, element);
  });

  return {
    origin: { x: bound.x, y: bound.y },
    content: sceneArr,
  };
}
