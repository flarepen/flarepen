import { Element, ElementHandler, RectangleData } from '../types';
import { MouseMove, BorderType } from '../../types';
import * as g from '../../geometry-v2/shapes';
import { boundsOfRenderedRows } from '../../geometry-v2/bounds';
import { elementIDGenerator } from '../../id';
import { X_SCALE, Y_SCALE } from '../../constants';

export const RectangleHandler: ElementHandler<RectangleData> = {
  type: 'rectangle',

  create(x, y) {
    return {
      id: elementIDGenerator.getNextID(),
      x, y,
      rows: g.rectangle(2, 2, BorderType.Normal),
      data: { type: 'rectangle', width: 2, height: 2, borderType: BorderType.Normal },
      labelEnabled: true,
    };
  },

  preview(element, mouseMove) {
    const widthIncr = mouseMove.accX > 0
      ? Math.floor(mouseMove.accX / X_SCALE)
      : Math.ceil(mouseMove.accX / X_SCALE);
    const heightIncr = mouseMove.accY > 0
      ? Math.floor(mouseMove.accY / Y_SCALE)
      : Math.ceil(mouseMove.accY / Y_SCALE);

    const newWidth = Math.max(2, element.data.width + widthIncr);
    const newHeight = Math.max(2, element.data.height + heightIncr);

    return {
      ...element,
      rows: g.rectangle(newWidth, newHeight, element.data.borderType),
      data: { ...element.data, width: newWidth, height: newHeight },
    };
  },

  bounds(element) {
    return boundsOfRenderedRows(element.rows, { x: element.x, y: element.y });
  },

  selectionBounds(element) {
    return this.bounds(element);
  },

  inVicinity(element, point) {
    const { x, y } = element;
    const w = element.data.width * X_SCALE;
    const h = element.data.height * Y_SCALE;
    
    // Check if near any edge
    const nearTop = Math.abs(point.y - y) < 10 && point.x >= x && point.x <= x + w;
    const nearBottom = Math.abs(point.y - (y + h)) < 10 && point.x >= x && point.x <= x + w;
    const nearLeft = Math.abs(point.x - x) < 10 && point.y >= y && point.y <= y + h;
    const nearRight = Math.abs(point.x - (x + w)) < 10 && point.y >= y && point.y <= y + h;
    
    return nearTop || nearBottom || nearLeft || nearRight;
  },
};
