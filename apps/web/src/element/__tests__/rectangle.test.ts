import { describe, it, expect } from 'vitest';
import { RectangleHandler } from '../rectangle';
import { ElementType } from '../base';
import { BorderType, MouseMove } from '../../types';
import { X_SCALE, Y_SCALE } from '../../constants';

describe('RectangleHandler', () => {
  const createRectangle = (overrides = {}) => ({
    id: 'rect1',
    x: 100,
    y: 100,
    width: 10,
    height: 5,
    borderType: BorderType.Normal,
    type: ElementType.Rectangle,
    shape: [],
    labelEnabled: true,
    ...overrides,
  });

  const createMouseMove = (accX = 0, accY = 0): MouseMove => {
    const mm = new MouseMove();
    mm.accX = accX;
    mm.accY = accY;
    return mm;
  };

  describe('new', () => {
    it('should create a new rectangle with default values', () => {
      const rect = RectangleHandler.new(100, 200);

      expect(rect.x).toBe(100);
      expect(rect.y).toBe(200);
      expect(rect.width).toBe(2);
      expect(rect.height).toBe(2);
      expect(rect.borderType).toBe(BorderType.Normal);
      expect(rect.type).toBe(ElementType.Rectangle);
      expect(rect.shape).toBeDefined();
    });
  });

  describe('outlineBounds', () => {
    it('should return correct bounds for a rectangle', () => {
      const rect = createRectangle();
      const bounds = RectangleHandler.outlineBounds(rect);

      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(100 - Y_SCALE / 4);
      expect(bounds.width).toBe(10 * X_SCALE);
      expect(bounds.height).toBe(5 * Y_SCALE - Y_SCALE / 2);
    });
  });

  describe('inVicinity', () => {
    it('should return true for point near rectangle edge', () => {
      const rect = createRectangle();
      const point = { x: 100, y: 100 };

      const result = RectangleHandler.inVicinity(rect, point);

      expect(result).toBe(true);
    });

    it('should return false for point far from rectangle', () => {
      const rect = createRectangle();
      const point = { x: 500, y: 500 };

      const result = RectangleHandler.inVicinity(rect, point);

      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should grow rectangle when dragging right and down', () => {
      const rect = createRectangle({ width: 2, height: 2 });
      const mouseMove = createMouseMove(X_SCALE * 3, Y_SCALE * 2);

      let updated;
      RectangleHandler.create(rect, mouseMove, (r) => { updated = r; });

      expect(updated.width).toBe(5); // 2 + 3
      expect(updated.height).toBe(4); // 2 + 2
      expect(updated.x).toBe(100);
      expect(updated.y).toBe(100);
    });

    it('should flip position when dragging left (negative width)', () => {
      const rect = createRectangle({ width: 2, height: 2 });
      const mouseMove = createMouseMove(-X_SCALE * 5, 0);

      let updated;
      RectangleHandler.create(rect, mouseMove, (r) => { updated = r; });

      expect(updated.width).toBe(-3); // Negative width
      expect(updated.x).toBe(100 - X_SCALE * 5); // Position flipped
    });

    it('should handle small movements', () => {
      const rect = createRectangle({ width: 2, height: 2 });
      const mouseMove = createMouseMove(X_SCALE * 0.5, 0); // Less than 1 cell

      let updated;
      RectangleHandler.create(rect, mouseMove, (r) => { updated = r; });

      // widthIncr = 0 (floor of 0.5), so width = 2 + 0 = 2
      expect(updated.width).toBe(2);
    });
  });

  describe('allEditHandles', () => {
    it('should return 8 edit handles', () => {
      const rect = createRectangle();
      const handles = RectangleHandler.allEditHandles(rect);

      expect(handles).toHaveLength(8);
      expect(handles.map(h => h.handleId)).toEqual([
        'top', 'bottom', 'right', 'left',
        'topLeft', 'bottomLeft', 'topRight', 'bottomRight'
      ]);
    });

    it('should position handles around rectangle bounds', () => {
      const rect = createRectangle();
      const handles = RectangleHandler.allEditHandles(rect);

      // Check that all handles have valid bounds
      handles.forEach(handle => {
        expect(handle.bounds.width).toBe(8);
        expect(handle.bounds.height).toBe(8);
        expect(handle.bounds.x).toBeTypeOf('number');
        expect(handle.bounds.y).toBeTypeOf('number');
      });
    });
  });

  describe('edit', () => {
    it('should resize from right handle', () => {
      const rect = createRectangle({ width: 10 });
      const mouseMove = createMouseMove(X_SCALE * 3, 0);

      const updated = RectangleHandler.edit(rect, mouseMove, 'right');

      expect(updated.width).toBe(13); // 10 + 3
      expect(updated.x).toBe(100); // Position unchanged
    });

    it('should resize from left handle and move position', () => {
      const rect = createRectangle({ width: 10 });
      const mouseMove = createMouseMove(X_SCALE * 2, 0);

      const updated = RectangleHandler.edit(rect, mouseMove, 'left');

      expect(updated.width).toBe(8); // 10 - 2
      expect(updated.x).toBe(100 + X_SCALE * 2); // Position moved
    });

    it('should resize from bottom handle', () => {
      const rect = createRectangle({ height: 5 });
      const mouseMove = createMouseMove(0, Y_SCALE * 2);

      const updated = RectangleHandler.edit(rect, mouseMove, 'bottom');

      expect(updated.height).toBe(7); // 5 + 2
      expect(updated.y).toBe(100); // Position unchanged
    });

    it('should resize from top handle and move position', () => {
      const rect = createRectangle({ height: 5 });
      const mouseMove = createMouseMove(0, Y_SCALE * 1);

      const updated = RectangleHandler.edit(rect, mouseMove, 'top');

      expect(updated.height).toBe(4); // 5 - 1
      expect(updated.y).toBe(100 + Y_SCALE * 1); // Position moved
    });

    it('should resize from corner handle (topLeft)', () => {
      const rect = createRectangle({ width: 10, height: 5 });
      const mouseMove = createMouseMove(X_SCALE * 2, Y_SCALE * 1);

      const updated = RectangleHandler.edit(rect, mouseMove, 'topLeft');

      expect(updated.width).toBe(8); // 10 - 2
      expect(updated.height).toBe(4); // 5 - 1
      expect(updated.x).toBe(100 + X_SCALE * 2);
      expect(updated.y).toBe(100 + Y_SCALE * 1);
    });

    it('should respect minimum width', () => {
      const rect = createRectangle({ width: 3 });
      const mouseMove = createMouseMove(-X_SCALE * 5, 0);

      const updated = RectangleHandler.edit(rect, mouseMove, 'right');

      expect(updated.width).toBe(3); // Stays at 3, doesn't go below min
    });

    it('should respect minimum width with label', () => {
      const rect = createRectangle({ width: 5, label: 'Hello' });
      const mouseMove = createMouseMove(-X_SCALE * 3, 0);

      const updated = RectangleHandler.edit(rect, mouseMove, 'right');

      // Min width = 2 + label.length = 2 + 5 = 7
      expect(updated.width).toBe(5); // Stays at 5, doesn't go below
    });

    it('should respect minimum height', () => {
      const rect = createRectangle({ height: 3 });
      const mouseMove = createMouseMove(0, -Y_SCALE * 5);

      const updated = RectangleHandler.edit(rect, mouseMove, 'bottom');

      expect(updated.height).toBe(3); // Stays at 3, doesn't go below min (2)
    });
  });

  describe('getGuideAnchors', () => {
    it('should return 5 anchor points for a rectangle', () => {
      const rect = createRectangle();
      const anchors = RectangleHandler.getGuideAnchors(rect);

      expect(anchors).toHaveLength(5);
    });

    it('should return correct anchor positions', () => {
      const rect = createRectangle();
      const anchors = RectangleHandler.getGuideAnchors(rect);

      const x = 100;
      const y = 100 - Y_SCALE / 2;
      const w = 10 * X_SCALE;
      const h = 5 * Y_SCALE;

      expect(anchors[0]).toEqual({ x, y }); // Top Left
      expect(anchors[1]).toEqual({ x: x + w, y }); // Top Right
      expect(anchors[2]).toEqual({ x, y: y + h }); // Bottom Left
      expect(anchors[3]).toEqual({ x: x + w, y: y + h }); // Bottom Right
      expect(anchors[4]).toEqual({ x: x + w / 2, y: y + h / 2 }); // Center
    });
  });
});
