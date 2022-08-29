import { getNextID } from '../id';
import { ElementCommons, ElementType, ElementUtils, getLinearBounding, IBounds } from './base';

export enum ArrowDirection {
  Left,
  Right,
  Up,
  Down,
  Undecided,
}

export interface Arrow extends ElementCommons {
  len: number;
  direction: ArrowDirection;
  type: ElementType.Arrow;
}

export const ArrowUtils: ElementUtils<Arrow> = {
  new: function (x: number, y: number): Arrow {
    return {
      id: getNextID(),
      x,
      y,
      len: 2,
      direction: ArrowDirection.Undecided,
      shape: [''],
      type: ElementType.Arrow,
    };
  },
  outlineBounds: function (arrow: Arrow): IBounds {
    const { xMin, xMax, yMin, yMax } = getLinearBounding(
      { x: arrow.x, y: arrow.y },
      arrow.len,
      arrow.direction === ArrowDirection.Left || arrow.direction === ArrowDirection.Right
    );

    return { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
  },
};
