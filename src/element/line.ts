import {
  ElementCommons,
  ElementType,
  ElementUtils,
  getLinearBounding,
  point,
  inLinearVicinity,
  Point,
  defaultDrag,
} from './base';
import { getNextID } from '../id';
import { X_SCALE, Y_SCALE } from '../constants';
import * as g from '../geometry';

export enum LineDirection {
  Up,
  Down,
  Left,
  Right,
  Undecided,
}

export interface Line extends ElementCommons {
  len: number;
  direction: LineDirection;
  type: ElementType.Line;
}

export function isHorizontalLine(line: Line): boolean {
  return line.direction === LineDirection.Left || line.direction === LineDirection.Right;
}

export const LineUtils: ElementUtils<Line> = {
  new: function (x: number, y: number) {
    return {
      id: getNextID(),
      x,
      y,
      len: 1,
      direction: LineDirection.Undecided,
      shape: [''],
      type: ElementType.Line,
    };
  },

  outlineBounds: function (line: Line) {
    let { xMin, xMax, yMin, yMax } = getLinearBounding(
      point(line.x, line.y),
      line.len,
      isHorizontalLine(line)
    );

    let width = xMax - xMin - X_SCALE;
    let height = yMax - yMin - Y_SCALE;

    if (isHorizontalLine(line)) {
      xMin = xMin + X_SCALE / 2;
      yMin = yMin + Y_SCALE / 2;
    } else {
      xMin = xMin + X_SCALE / 2;
      yMin = yMin + Y_SCALE / 4;
      width = xMax - xMin + 4;
      height = yMax - yMin - (5 / 4) * Y_SCALE;
    }

    return { x: xMin, y: yMin, width: width, height };
  },

  inVicinity: function (line: Line, p: Point) {
    return inLinearVicinity(p, point(line.x, line.y), line.len, isHorizontalLine(line));
  },

  moveToEdit: function (line, mouseMove, callback) {
    let widthIncr =
      mouseMove.accX > 0
        ? Math.floor(mouseMove.accX / X_SCALE)
        : Math.ceil(mouseMove.accX / X_SCALE);
    let heightIncr =
      mouseMove.accY > 0
        ? Math.floor(mouseMove.accY / Y_SCALE)
        : Math.ceil(mouseMove.accY / Y_SCALE);

    // Decide direction if not present
    if (line.direction === LineDirection.Undecided) {
      widthIncr > 0 && (line.direction = LineDirection.Right);
      widthIncr < 0 && (line.direction = LineDirection.Left);
      heightIncr > 0 && (line.direction = LineDirection.Down);
      heightIncr < 0 && (line.direction = LineDirection.Up);
    }

    // Swap Direction
    if (line.direction !== LineDirection.Undecided) {
      if (line.direction === LineDirection.Right && line.len + widthIncr < 0) {
        line.direction = LineDirection.Left;
        // Reset line length
        widthIncr = widthIncr + line.len;
        line.len = 1;
      }
      if (line.direction === LineDirection.Left && line.len - widthIncr <= 0) {
        line.direction = LineDirection.Right;
        // Reset line length
        widthIncr = widthIncr - line.len;
        line.len = 1;
      }
      if (line.direction === LineDirection.Down && line.len + heightIncr < 0) {
        line.direction = LineDirection.Up;
        // Reset line length
        heightIncr = heightIncr + line.len;
        line.len = 1;
      }
      if (line.direction === LineDirection.Up && line.len - heightIncr <= 0) {
        line.direction = LineDirection.Down;
        // Reset line length
        heightIncr = heightIncr - line.len;
        line.len = 1;
      }
    }

    // Start drawing if we only know the direction
    if (line.direction !== LineDirection.Undecided) {
      switch (line.direction) {
        case LineDirection.Right:
          line.len += widthIncr;
          break;
        case LineDirection.Left:
          line.x = line.x + widthIncr * X_SCALE;
          line.len -= widthIncr;
          break;
        case LineDirection.Down:
          line.len += heightIncr;
          break;
        case LineDirection.Up:
          line.y = line.y + heightIncr * Y_SCALE;
          line.len -= heightIncr;
          break;
      }

      callback({
        ...line,
        shape: g.line(line.len, isHorizontalLine(line)),
      });
    }
  },

  drag: defaultDrag,
};
