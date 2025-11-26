import { X_SCALE, Y_SCALE } from '../constants';
import { elementIDGenerator } from '../id';
import {
  ElementCommons,
  ElementType,
  ElementUtils,
  getLinearBounding,
  IBounds,
  inLinearVicinity,
  isPointInsideBound,
  Point,
} from './base';
import * as g from '../geometry';
import { EditHandle } from '../types';
import _ from 'lodash';

const HANDLE_SIZE = 8;

function handle(x: number, y: number, handleId: string): EditHandle {
  return {
    bounds: { x, y, width: HANDLE_SIZE, height: HANDLE_SIZE },
    handleId,
  };
}

import { LinearDirection, LinearElement, LinearElementUtils } from './linear';

export interface Arrow extends LinearElement {
  type: ElementType.Arrow;
}

export const ArrowUtils: ElementUtils<Arrow> = {
  new: function (x: number, y: number): Arrow {
    return {
      id: elementIDGenerator.getNextID(),
      x,
      y,
      len: 2,
      direction: LinearDirection.Undecided,
      shape: [''],
      type: ElementType.Arrow,
      labelEnabled: false,
    };
  },
  outlineBounds: function (arrow: Arrow) {
    return LinearElementUtils.outlineBounds(arrow);
  },

  inVicinity: function (arrow: Arrow, p: Point) {
    return LinearElementUtils.inVicinity(arrow, p);
  },

  create: function (arrow, mouseMove, callback) {
    const widthIncr =
      mouseMove.accX > 0
        ? Math.floor(mouseMove.accX / X_SCALE)
        : Math.ceil(mouseMove.accX / X_SCALE);
    const heightIncr =
      mouseMove.accY > 0
        ? Math.floor(mouseMove.accY / Y_SCALE)
        : Math.ceil(mouseMove.accY / Y_SCALE);

    const result = LinearElementUtils.handleDirectionChange(arrow, widthIncr, heightIncr, 2);
    if (result) {
      Object.assign(arrow, result);
    }

    if (arrow.direction !== LinearDirection.Undecided) {
      switch (arrow.direction) {
        case LinearDirection.Right:
          arrow.len += widthIncr;
          break;
        case LinearDirection.Left:
          arrow.x = arrow.x + widthIncr * X_SCALE;
          arrow.len -= widthIncr;
          break;
        case LinearDirection.Down:
          arrow.len += heightIncr;
          break;
        case LinearDirection.Up:
          arrow.y = arrow.y + heightIncr * Y_SCALE;
          arrow.len -= heightIncr;
          break;
      }

      callback({
        ...arrow,
        shape: g.arrow(arrow.len, arrow.direction),
      });
    }
  },

  allEditHandles: function (arrow) {
    return LinearElementUtils.allEditHandles(arrow);
  },

  getEditHandleId: function (arrow, e) {
    return LinearElementUtils.getEditHandleId(arrow, e);
  },

  edit: function (arrow, mouseMove, handleId) {
    const result = LinearElementUtils.edit(arrow, mouseMove, handleId, 2);
    return {
      ...arrow,
      ...result,
      shape: g.arrow(result.len, arrow.direction),
    };
  },
  getGuideAnchors: function (arrow) {
    return [];
  },
};
