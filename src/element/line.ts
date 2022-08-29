import { ElementCommons, ElementType, ElementUtils, getLinearBounding, point } from './base';
import { getNextID } from '../id';

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
};
