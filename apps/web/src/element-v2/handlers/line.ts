import { Element, ElementHandler, LineData, Point } from '../types';
import { MouseMove } from '../../types';
import * as g from '../../geometry-v2/shapes';
import { boundsOfRenderedRows } from '../../geometry-v2/bounds';
import { elementIDGenerator } from '../../id';

export const LineHandler: ElementHandler<LineData> = {
  type: 'line',

  create(x, y) {
    const points = [{ x, y }];
    return {
      id: elementIDGenerator.getNextID(),
      x, y,
      rows: g.polyline(points),
      data: { type: 'line', points },
      labelEnabled: false,
    };
  },

  preview(element, mouseMove) {
    const lastPoint = element.data.points[element.data.points.length - 1];
    const newPoint = { 
      x: mouseMove.currentEvent?.clientX || lastPoint.x,
      y: mouseMove.currentEvent?.clientY || lastPoint.y 
    };
    
    // Snap to dominant direction
    const dx = Math.abs(newPoint.x - lastPoint.x);
    const dy = Math.abs(newPoint.y - lastPoint.y);
    const snapped = dx > dy 
      ? { x: newPoint.x, y: lastPoint.y }
      : { x: lastPoint.x, y: newPoint.y };
    
    const newPoints = [...element.data.points, snapped];
    const minX = Math.min(...newPoints.map(p => p.x));
    const minY = Math.min(...newPoints.map(p => p.y));
    
    return {
      ...element,
      x: minX,
      y: minY,
      rows: g.polyline(newPoints),
      data: { type: 'line', points: newPoints },
    };
  },

  bounds(element) {
    return boundsOfRenderedRows(element.rows, { x: element.x, y: element.y });
  },

  selectionBounds(element) {
    return this.bounds(element);
  },

  inVicinity(element, point) {
    const bounds = this.bounds(element);
    return (
      point.x >= bounds.origin.x &&
      point.x <= bounds.origin.x + bounds.width &&
      point.y >= bounds.origin.y &&
      point.y <= bounds.origin.y + bounds.height
    );
  },
};
