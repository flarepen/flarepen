import { ArrowDirection, Element, ElementType, LineDirection, point, Point } from './element';
import _ from 'lodash';
import { X_SCALE, Y_SCALE } from './constants';

export type Row = string;
export type Shape = Row[];

const SYMBOLS = {
  LEFT_TOP: '┌',
  RIGHT_TOP: '┐',
  LEFT_BOTTOM: '└',
  RIGHT_BOTTOM: '┘',
  HORIZONTAL: '─',
  VERTICAL: '│',
  ARROW_LEFT: '◀',
  ARROW_RIGHT: '▶',
  ARROW_UP: '▲',
  ARROW_DOWN: '▼',
};

// TODO: Add better validations and edge case handling
export function rectangle(width: number, height: number): Shape {
  const shape = [];
  // Top
  shape.push(
    SYMBOLS.LEFT_TOP +
      (width - 2 > 0 ? SYMBOLS.HORIZONTAL.repeat(width - 2) : '') +
      SYMBOLS.RIGHT_TOP
  );
  // Mids
  if (height - 2 > 0) {
    for (let i = height - 2; i > 0; i--) {
      shape.push(
        SYMBOLS.VERTICAL + (width - 2 > 0 ? ' '.repeat(width - 2) : '') + SYMBOLS.VERTICAL
      );
    }
  }
  // Bottom
  shape.push(
    SYMBOLS.LEFT_BOTTOM +
      (width - 2 > 0 ? SYMBOLS.HORIZONTAL.repeat(width - 2) : '') +
      SYMBOLS.RIGHT_BOTTOM
  );
  return shape;
}

export function line(len: number, horizontal: boolean): Shape {
  if (horizontal) {
    return [SYMBOLS.HORIZONTAL.repeat(len)];
  }
  return Array(len).fill(SYMBOLS.VERTICAL);
}

export function arrow(len: number, direction: ArrowDirection): Shape {
  let shape = [];
  switch (direction) {
    case ArrowDirection.Right:
      return [line(len - 1, true)[0] + SYMBOLS.ARROW_RIGHT];
    case ArrowDirection.Left:
      return [SYMBOLS.ARROW_LEFT + line(len - 1, true)[0]];
    case ArrowDirection.Up:
      shape = line(len - 1, false);
      shape.unshift(SYMBOLS.ARROW_UP);
      return shape;
    case ArrowDirection.Down:
      shape = line(len - 1, false);
      shape.push(SYMBOLS.ARROW_DOWN);
      return shape;
    case ArrowDirection.Undecided:
      return [''];
  }
}

// TODO: Where to keep this implementation?
function getWidth(element: Element) {
  switch (element.type) {
    case ElementType.Rectangle:
      return element.width;
    case ElementType.Line:
      return element.direction === LineDirection.Horizontal ? element.len : 1;
    case ElementType.Arrow:
      return element.direction === ArrowDirection.Left || element.direction === ArrowDirection.Right
        ? element.len
        : 1;
  }
}

function getHeight(element: Element) {
  switch (element.type) {
    case ElementType.Rectangle:
      return element.height;
    case ElementType.Line:
      return element.direction === LineDirection.Vertical ? element.len : 1;
    case ElementType.Arrow:
      return element.direction === ArrowDirection.Up || element.direction === ArrowDirection.Down
        ? element.len
        : 1;
  }
}

function writeToScene(origin: Point, sceneArr: string[][], element: Element) {
  const offsetX = (element.x - origin.x) / X_SCALE;
  const offsetY = (element.y - origin.y) / Y_SCALE;

  const shape: string[][] = _.map(element.shape, (row) => row.split(''));

  shape.forEach((row, rowNum) => {
    row.forEach((s, colNum) => {
      sceneArr[rowNum + offsetY][colNum + offsetX] = s;
    });
  });
}

export function scene(elements: Element[]): string {
  // Find boundaries
  const xMin = _.min(_.map(elements, (element) => element.x)) || 0;
  const xMax = _.max(_.map(elements, (element) => element.x + getWidth(element) * X_SCALE)) || 0;
  const yMin = _.min(_.map(elements, (element) => element.y)) || 0;
  const yMax = _.max(_.map(elements, (element) => element.y + getHeight(element) * Y_SCALE)) || 0;

  const width = Math.floor((xMax - xMin) / X_SCALE);
  const height = Math.floor((yMax - yMin) / Y_SCALE);

  // Create a 2D array
  let sceneArr: string[][] = [];
  for (let i = 0; i < height; i++) {
    sceneArr.push(new Array(width).fill(' '));
  }

  // Fill the array
  elements.forEach((element) => {
    writeToScene(point(xMin, yMin), sceneArr, element);
  });

  // Merge everything
  return _.map(sceneArr, (row) => row.join('')).join('\n');
}
