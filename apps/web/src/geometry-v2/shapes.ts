/**
 * Shape Generation
 *
 * Pure functions that generate ASCII shapes.
 *
 * rectangle(8, 4):        line(10, true):      arrow(5, Down):
 *   ┌──────┐                ──────────           │
 *   │      │                                     │
 *   │      │                                     │
 *   └──────┘                                     │
 *                                                ▼
 *
 * text('Hello World'):
 *   Hello World
 */

import { RenderedShape, rendered } from './types';

// ============================================================================
// Enums
// ============================================================================

export enum BorderType {
  Normal = 'normal',
  Double = 'double',
  Heavy = 'heavy',
  Rounded = 'rounded',
}

export enum LinearDirection {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
  Undecided = 'undecided',
}

// ============================================================================
// Constants
// ============================================================================

export const HORIZONTAL = '─';
export const VERTICAL = '│';

export const ARROW_UP = '▲';
export const ARROW_DOWN = '▼';
export const ARROW_LEFT = '◀';
export const ARROW_RIGHT = '▶';

const BOX = {
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

// ============================================================================
// Shape Functions
// ============================================================================

export function rectangle(
  width: number,
  height: number,
  borderType: BorderType = BorderType.Normal,
  label?: string
): RenderedShape {
  if (width <= 0 || height <= 0) {
    return rendered([''], 0, 0);
  }

  const box = BOX[borderType];

  if (width === 1 && height === 1) {
    return rendered([box.LEFT_TOP + box.RIGHT_TOP], 1, 1);
  }

  if (width === 1) {
    return rendered(
      [box.LEFT_TOP, ...Array(height - 2).fill(box.VERTICAL), box.LEFT_BOTTOM],
      1,
      height
    );
  }

  if (height === 1) {
    return rendered([box.LEFT_TOP + box.HORIZONTAL.repeat(width - 2) + box.RIGHT_TOP], width, 1);
  }

  // Top row with optional label
  let top: string;
  if (label) {
    const labelLen = label.length;
    const remainingWidth = width - labelLen - 2;
    top =
      box.LEFT_TOP +
      label +
      (remainingWidth > 0 ? box.HORIZONTAL.repeat(remainingWidth) : '') +
      box.RIGHT_TOP;
  } else {
    top = box.LEFT_TOP + box.HORIZONTAL.repeat(width - 2) + box.RIGHT_TOP;
  }

  const middle = box.VERTICAL + ' '.repeat(width - 2) + box.VERTICAL;
  const bottom = box.LEFT_BOTTOM + box.HORIZONTAL.repeat(width - 2) + box.RIGHT_BOTTOM;

  return rendered([top, ...Array(height - 2).fill(middle), bottom], width, height);
}

export function line(len: number, horizontal: boolean): RenderedShape {
  if (horizontal) {
    return rendered([HORIZONTAL.repeat(len)], len, 1);
  }
  return rendered(Array(len).fill(VERTICAL), 1, len);
}

export function arrow(len: number, direction: LinearDirection): RenderedShape {
  if (len <= 0) {
    return rendered([''], 0, 0);
  }

  const lineShape = line(
    len - 1,
    direction === LinearDirection.Right || direction === LinearDirection.Left
  );

  switch (direction) {
    case LinearDirection.Right:
      return rendered([lineShape.rows[0] + ARROW_RIGHT], len, 1);
    case LinearDirection.Left:
      return rendered([ARROW_LEFT + lineShape.rows[0]], len, 1);
    case LinearDirection.Up:
      return rendered([ARROW_UP, ...lineShape.rows], 1, len);
    case LinearDirection.Down:
      return rendered([...lineShape.rows, ARROW_DOWN], 1, len);
    case LinearDirection.Undecided:
      return rendered([''], 0, 0);
  }
}

export function text(content: string): RenderedShape {
  return rendered([content], content.length, 1);
}

// Re-export polyline and polyarrow
export { polyline } from './polyline';
export { polyarrow } from './polyarrow';
