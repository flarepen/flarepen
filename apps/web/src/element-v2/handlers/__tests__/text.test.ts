import { describe, it, expect } from 'vitest';
import { TextHandler } from '../text';
import { MouseMove } from '../../../types';

describe('TextHandler', () => {
  it('creates empty text element', () => {
    const element = TextHandler.create({ col: 5, row: 3 });
    
    expect(element.position).toEqual({ col: 5, row: 3 });
    expect(element.data.type).toBe('text');
    expect(element.data.content).toBe('');
    expect(element.shape.rows).toEqual(['']);
  });

  it('returns empty edit handles', () => {
    const element = TextHandler.create({ col: 0, row: 0 });
    expect(TextHandler.editHandles(element)).toEqual([]);
  });

  it('returns empty guide anchors', () => {
    const element = TextHandler.create({ col: 0, row: 0 });
    expect(TextHandler.guideAnchors(element)).toEqual([]);
  });

  it('applyEdit with mouse input returns element unchanged', () => {
    const element = TextHandler.create({ col: 0, row: 0 });
    const mouseMove = new MouseMove();
    
    expect(TextHandler.applyEdit(element, null, mouseMove)).toBe(element);
  });

  it('applyEdit with keyboard input updates content', () => {
    const element = TextHandler.create({ col: 0, row: 0 });
    const keyboardInput = { kind: 'keyboard' as const, content: 'Hello' };
    
    const updated = TextHandler.applyEdit(element, null, keyboardInput);
    
    expect(updated.data.content).toBe('Hello');
    expect(updated.shape.rows).toEqual(['Hello']);
  });
});
