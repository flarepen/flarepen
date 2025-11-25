import { describe, it, expect } from 'vitest';
import { buildScene } from '../scene';

describe('buildScene', () => {
  it('merges rectangle with text inside', () => {
    const positioned = [
      {
        rows: [
          '┌─────────┐',
          '│         │',
          '│         │',
          '└─────────┘',
        ],
        position: { x: 0, y: 0 },
      },
      {
        rows: ['Button'],
        position: { x: 26, y: 20 }, // Centered inside rectangle
      },
    ];

    const scene = buildScene(positioned);

    expect(scene.origin).toEqual({ x: 0, y: 0 });
    expect(scene.content.map(row => row.join(''))).toEqual([
      '┌─────────┐',
      '│ Button  │',
      '│         │',
      '└─────────┘',
    ]);
  });

  it('merges rectangle with arrow pointing to another rectangle', () => {
    const positioned = [
      {
        rows: [
          '┌─────┐',
          '│ Box │',
          '└─────┘',
        ],
        position: { x: 0, y: 0 },
      },
      {
        rows: ['────▶'],
        position: { x: 104, y: 20 }, // Arrow with space
      },
      {
        rows: [
          '┌─────┐',
          '│ Box │',
          '└─────┘',
        ],
        position: { x: 182, y: 0 }, // Second box with space
      },
    ];

    const scene = buildScene(positioned);

    expect(scene.origin).toEqual({ x: 0, y: 0 });
    expect(scene.content.map(row => row.join(''))).toEqual([
      '┌─────┐       ┌─────┐',
      '│ Box │ ────▶ │ Box │',
      '└─────┘       └─────┘',
    ]);
  });

  it('merges vertical arrow between rectangles', () => {
    const positioned = [
      {
        rows: [
          '┌──────┐',
          '│ Top  │',
          '└──────┘',
        ],
        position: { x: 0, y: 0 },
      },
      {
        rows: [
          '│',
          '│',
          '▼'
        ],
        position: { x: 39, y: 60 }, // Arrow down from center
      },
      {
        rows: [
          '┌──────┐',
          '│Bottom│',
          '└──────┘',
        ],
        position: { x: 0, y: 120 },
      },
    ];

    const scene = buildScene(positioned);

    expect(scene.origin).toEqual({ x: 0, y: 0 });
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

  it('handles empty positioned rows array', () => {
    const scene = buildScene([]);
    
    expect(scene.content).toEqual([[]]);
  });

  it('merges multiple text labels', () => {
    const positioned = [
      {
        rows: ['Label 1'],
        position: { x: 0, y: 0 },
      },
      {
        rows: ['Label 2'],
        position: { x: 0, y: 20 },
      },
      {
        rows: ['Label 3'],
        position: { x: 0, y: 40 },
      },
    ];

    const scene = buildScene(positioned);

    expect(scene.content.map(row => row.join(''))).toEqual([
      'Label 1',
      'Label 2',
      'Label 3',
    ]);
  });
});
