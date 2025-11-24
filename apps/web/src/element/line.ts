import { ElementType, ElementUtils } from './base';
import { elementIDGenerator } from '../id';
import { X_SCALE, Y_SCALE } from '../constants';
import * as g from '../geometry';
import { LinearDirection, LinearElement, LinearElementUtils, isHorizontal } from './linear';

export interface Line extends LinearElement {
  type: ElementType.Line;
}

export const LineUtils: ElementUtils<Line> = {
  new: function (x: number, y: number) {
    return {
      id: elementIDGenerator.getNextID(),
      x,
      y,
      len: 1,
      direction: LinearDirection.Undecided,
      shape: [''],
      type: ElementType.Line,
      labelEnabled: false,
    };
  },

  outlineBounds: function (line: Line) {
    return LinearElementUtils.outlineBounds(line);
  },

  inVicinity: function (line, p) {
    return LinearElementUtils.inVicinity(line, p);
  },

  create: function (line, mouseMove, callback) {
    // Multi-segment line with points array
    if (line.points && line.points.length > 0) {
      const lastPoint = line.points[line.points.length - 1];
      let previewPoint = {
        x: mouseMove.currentEvent?.clientX || line.x,
        y: mouseMove.currentEvent?.clientY || line.y,
      };
      
      // Snap to dominant direction from last point
      const dx = Math.abs(previewPoint.x - lastPoint.x);
      const dy = Math.abs(previewPoint.y - lastPoint.y);
      
      if (dx > dy) {
        // Horizontal dominant - lock y
        previewPoint.y = lastPoint.y;
      } else {
        // Vertical dominant - lock x
        previewPoint.x = lastPoint.x;
      }
      
      const allPoints = [...line.points, previewPoint];
      
      // Calculate bounding box
      const minX = Math.min(...allPoints.map(p => p.x));
      const minY = Math.min(...allPoints.map(p => p.y));
      
      callback({
        ...line,
        x: minX,
        y: minY,
        points: allPoints,
        shape: g.polyline(allPoints),
      });
      return;
    }

    // Single-segment line (existing behavior)
    const widthIncr =
      mouseMove.accX > 0
        ? Math.floor(mouseMove.accX / X_SCALE)
        : Math.ceil(mouseMove.accX / X_SCALE);
    const heightIncr =
      mouseMove.accY > 0
        ? Math.floor(mouseMove.accY / Y_SCALE)
        : Math.ceil(mouseMove.accY / Y_SCALE);

    const result = LinearElementUtils.handleDirectionChange(line, widthIncr, heightIncr, 1);
    if (result) {
      Object.assign(line, result);
    }

    if (line.direction !== LinearDirection.Undecided) {
      switch (line.direction) {
        case LinearDirection.Right:
          line.len += widthIncr;
          break;
        case LinearDirection.Left:
          line.x = line.x + widthIncr * X_SCALE;
          line.len -= widthIncr;
          break;
        case LinearDirection.Down:
          line.len += heightIncr;
          break;
        case LinearDirection.Up:
          line.y = line.y + heightIncr * Y_SCALE;
          line.len -= heightIncr;
          break;
      }

      callback({
        ...line,
        shape: g.line(line.len, isHorizontal(line)),
      });
    }
  },

  allEditHandles: function (line) {
    return LinearElementUtils.allEditHandles(line);
  },

  getEditHandleType: function (line, e) {
    return LinearElementUtils.getEditHandleType(line, e);
  },

  edit: function (line, mouseMove, handleType) {
    const result = LinearElementUtils.edit(line, mouseMove, handleType, 1);
    return {
      ...line,
      ...result,
      shape: g.line(result.len, isHorizontal(line)),
    };
  },

  getGuideAnchors: function (line) {
    return [];
  },
};
