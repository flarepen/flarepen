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
  Horizontal,
  Vertical,
  Undecided,
}

export interface Line extends ElementCommons {
  len: number;
  direction: LineDirection;
  type: ElementType.Line;
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
    const { xMin, xMax, yMin, yMax } = getLinearBounding(
      point(line.x, line.y),
      line.len,
      line.direction === LineDirection.Horizontal
    );

    return {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin,
    };
  },

  inVicinity: function (line: Line, p: Point) {
    return inLinearVicinity(
      p,
      point(line.x, line.y),
      line.len,
      line.direction === LineDirection.Horizontal
    );
  },

  moveToEdit: function (line, mouseMove, callback) {
    const widthIncr =
      mouseMove.accX > 0
        ? Math.floor(mouseMove.accX / X_SCALE)
        : Math.ceil(mouseMove.accX / X_SCALE);
    const heightIncr =
      mouseMove.accY > 0
        ? Math.floor(mouseMove.accY / Y_SCALE)
        : Math.ceil(mouseMove.accY / Y_SCALE);

    // Decide direction if not present
    if (line.direction === LineDirection.Undecided) {
      if (widthIncr !== 0) {
        line.direction = LineDirection.Horizontal;
      }
      if (heightIncr !== 0) {
        line.direction = LineDirection.Vertical;
      }
    }

    // Start drawing if we only know the direction
    if (line.direction !== LineDirection.Undecided) {
      switch (line.direction) {
        case LineDirection.Horizontal:
          line.len += widthIncr;
          break;
        case LineDirection.Vertical:
          line.len += heightIncr;
          break;
      }

      callback({
        ...line,
        shape: g.line(line.len, line.direction === LineDirection.Horizontal),
      });
    }
  },

  drag: defaultDrag,
};
