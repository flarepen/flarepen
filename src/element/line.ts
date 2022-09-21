import {
  ElementCommons,
  ElementType,
  ElementUtils,
  getLinearBounding,
  point,
  inLinearVicinity,
  Point,
  isPointInsideBound,
} from './base';
import { elementID } from '../id';
import { X_SCALE, Y_SCALE } from '../constants';
import * as g from '../geometry';
import { EditHandleType, EditHandle } from '../types';
import _ from 'lodash';

const HANDLE_SIZE = 8;

function handle(x: number, y: number, handleType: EditHandleType): EditHandle {
  return {
    bounds: { x, y, width: HANDLE_SIZE, height: HANDLE_SIZE },
    handleType,
  };
}

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
      id: elementID.getNextID(),
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

  allEditHandles: function (line) {
    const { x, y, width, height } = LineUtils.outlineBounds(line);

    if (isHorizontalLine(line)) {
      return [
        handle(x - HANDLE_SIZE, y + height / 2 - HANDLE_SIZE / 2, 'left'),
        handle(x + width, y + height / 2 - HANDLE_SIZE / 2, 'right'),
      ];
    }

    return [
      handle(x + width / 2 - HANDLE_SIZE / 2, y - HANDLE_SIZE, 'top'),
      handle(x + width / 2 - HANDLE_SIZE / 2, y + height, 'bottom'),
    ];
  },
  getEditHandleType: function (line, e) {
    const point = {
      x: e.clientX,
      y: e.clientY,
    };

    const handle = _.find(LineUtils.allEditHandles(line), (handle) =>
      isPointInsideBound(point, handle.bounds)
    );

    return handle?.handleType || null;
  },
  edit: function (line, mouseMove, handleType) {
    let { x, y, len } = line;

    const widthIncr =
      mouseMove.accX > 0
        ? Math.floor(mouseMove.accX / X_SCALE)
        : Math.ceil(mouseMove.accX / X_SCALE);
    const heightIncr =
      mouseMove.accY > 0
        ? Math.floor(mouseMove.accY / Y_SCALE)
        : Math.ceil(mouseMove.accY / Y_SCALE);

    switch (handleType) {
      case 'left':
        if (len - widthIncr >= 1) {
          x = x + widthIncr * X_SCALE;
          len = len - widthIncr;
        }
        break;
      case 'right':
        if (len + widthIncr >= 1) {
          len = len + widthIncr;
        }
        break;
      case 'top':
        if (len - heightIncr >= 1) {
          y = y + heightIncr * Y_SCALE;
          len = len - heightIncr;
        }
        break;
      case 'bottom':
        if (len + heightIncr >= 1) {
          len = len + heightIncr;
        }
        break;
    }

    return {
      ...line,
      x,
      y,
      len,
      shape: g.line(len, isHorizontalLine(line)),
    };
  },
};
