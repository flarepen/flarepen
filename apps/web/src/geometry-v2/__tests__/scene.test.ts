import { describe, it, expect } from 'vitest';
import { buildScene } from '../scene';

describe('buildScene', () => {
  it('merges rectangle with text inside', () => {
    const shapes = [
      {
        shape: {
          rows: [
            '┌─────────┐',
            '│         │',
            '│         │',
            '└─────────┘',
          ],
          width: 11,
          height: 4,
        },
        position: { col: 0, row: 0 },
      },
      {
        shape: {
          rows: ['Button'],
          width: 6,
          height: 1,
        },
        position: { col: 2, row: 1 },
      },
    ];

    const scene = buildScene(shapes);

    expect(scene.origin).toEqual({ col: 0, row: 0 });
    expect(scene.content.map(row => row.join(''))).toEqual([
      '┌─────────┐',
      '│ Button  │',
      '│         │',
      '└─────────┘',
    ]);
  });

  it('merges rectangle with arrow pointing to another rectangle', () => {
    const shapes = [
      {
        shape: {
          rows: [
            '┌─────┐',
            '│ Box │',
            '└─────┘',
          ],
          width: 7,
          height: 3,
        },
        position: { col: 0, row: 0 },
      },
      {
        shape: {
          rows: ['────▶'],
          width: 5,
          height: 1,
        },
        position: { col: 8, row: 1 },
      },
      {
        shape: {
          rows: [
            '┌─────┐',
            '│ Box │',
            '└─────┘',
          ],
          width: 7,
          height: 3,
        },
        position: { col: 14, row: 0 },
      },
    ];

    const scene = buildScene(shapes);

    expect(scene.origin).toEqual({ col: 0, row: 0 });
    expect(scene.content.map(row => row.join(''))).toEqual([
      '┌─────┐       ┌─────┐',
      '│ Box │ ────▶ │ Box │',
      '└─────┘       └─────┘',
    ]);
  });

  it('merges vertical arrow between rectangles', () => {
    const shapes = [
      {
        shape: {
          rows: [
            '┌──────┐',
            '│ Top  │',
            '└──────┘',
          ],
          width: 8,
          height: 3,
        },
        position: { col: 0, row: 0 },
      },
      {
        shape: {
          rows: ['│', '│', '▼'],
          width: 1,
          height: 3,
        },
        position: { col: 3, row: 3 },
      },
      {
        shape: {
          rows: [
            '┌──────┐',
            '│Bottom│',
            '└──────┘',
          ],
          width: 8,
          height: 3,
        },
        position: { col: 0, row: 6 },
      },
    ];

    const scene = buildScene(shapes);

    expect(scene.origin).toEqual({ col: 0, row: 0 });
    expect(scene.content.map(row => row.join(''))).toEqual([
      '┌──────┐',
      '│ Top  │',
      '└──────┘',
      '   │    ',
      '   │    ',
      '   ▼    ',
      '┌──────┐',
      '│Bottom│',
      '└──────┘',
    ]);
  });

  it('handles empty shapes array', () => {
    const scene = buildScene([]);
    
    expect(scene.content).toEqual([[]]);
  });

  it('merges multiple text labels', () => {
    const shapes = [
      {
        shape: {
          rows: ['Label 1'],
          width: 7,
          height: 1,
        },
        position: { col: 0, row: 0 },
      },
      {
        shape: {
          rows: ['Label 2'],
          width: 7,
          height: 1,
        },
        position: { col: 0, row: 1 },
      },
      {
        shape: {
          rows: ['Label 3'],
          width: 7,
          height: 1,
        },
        position: { col: 0, row: 2 },
      },
    ];

    const scene = buildScene(shapes);

    expect(scene.content.map(row => row.join(''))).toEqual([
      'Label 1',
      'Label 2',
      'Label 3',
    ]);
  });
});
