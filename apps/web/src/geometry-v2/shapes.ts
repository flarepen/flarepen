import { RenderedRows } from './types';

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

const HORIZONTAL = '─';
const VERTICAL = '│';

const ARROW_UP = '▲';
const ARROW_DOWN = '▼';
const ARROW_LEFT = '◀';
const ARROW_RIGHT = '▶';

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
  borderType: BorderType = BorderType.Normal
): RenderedRows {
  if (width <= 0 || height <= 0) return [''];

  const box = BOX[borderType];

  if (width === 1 && height === 1) {
    return [box.LEFT_TOP + box.RIGHT_TOP];
  }

  if (width === 1) {
    return [box.LEFT_TOP, ...Array(height - 2).fill(box.VERTICAL), box.LEFT_BOTTOM];
  }

  if (height === 1) {
    return [box.LEFT_TOP + box.HORIZONTAL.repeat(width - 2) + box.RIGHT_TOP];
  }

  const top = box.LEFT_TOP + box.HORIZONTAL.repeat(width - 2) + box.RIGHT_TOP;
  const middle = box.VERTICAL + ' '.repeat(width - 2) + box.VERTICAL;
  const bottom = box.LEFT_BOTTOM + box.HORIZONTAL.repeat(width - 2) + box.RIGHT_BOTTOM;

  return [top, ...Array(height - 2).fill(middle), bottom];
}

export function line(len: number, horizontal: boolean): RenderedRows {
  if (horizontal) {
    return [HORIZONTAL.repeat(len)];
  }
  return Array(len).fill(VERTICAL);
}

export function arrow(len: number, direction: LinearDirection): RenderedRows {
  if (len <= 0) return [''];
  
  switch (direction) {
    case LinearDirection.Right:
      return [line(len - 1, true)[0] + ARROW_RIGHT];
    case LinearDirection.Left:
      return [ARROW_LEFT + line(len - 1, true)[0]];
    case LinearDirection.Up:
      return [ARROW_UP, ...line(len - 1, false)];
    case LinearDirection.Down:
      return [...line(len - 1, false), ARROW_DOWN];
    case LinearDirection.Undecided:
      return [''];
  }
}

export function text(content: string): RenderedRows {
  return [content];
}
