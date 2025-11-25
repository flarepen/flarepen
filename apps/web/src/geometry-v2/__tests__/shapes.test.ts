import { describe, it, expect } from 'vitest';
import { rectangle, BorderType, line, arrow, LinearDirection, text, polyline, polyarrow } from '../shapes';

describe('rectangle', () => {
  it('creates a basic rectangle', () => {
    const result = rectangle(5, 3);
    
    expect(result).toEqual([
      '┌───┐',
      '│   │',
      '└───┘'
    ]);
  });

  it.each([
    ['1x1 rectangle', 1, 1, ['┌┐']],
    [
      'tall thin rectangle',
      1,
      3,
      [
        '┌',
        '│',
        '└'
      ]
    ],
    ['wide flat rectangle', 5, 1, ['┌───┐']],
  ])('creates %s', (name, width, height, expected) => {
    expect(rectangle(width, height)).toEqual(expected);
  });

  it.each([
    ['zero width', 0, 3],
    ['zero height', 5, 0],
  ])('handles %s', (name, width, height) => {
    expect(rectangle(width, height)).toEqual(['']);
  });

  it('creates a large rectangle', () => {
    const result = rectangle(10, 5);
    
    expect(result).toHaveLength(5);
    expect(result[0]).toBe('┌────────┐');
    expect(result[1]).toBe('│        │');
    expect(result[4]).toBe('└────────┘');
  });

  describe('border types', () => {
    it.each([
      [
        'normal',
        BorderType.Normal,
        [
          '┌───┐',
          '│   │',
          '└───┘'
        ]
      ],
      [
        'double',
        BorderType.Double,
        [
          '╔═══╗',
          '║   ║',
          '╚═══╝'
        ]
      ],
      [
        'heavy',
        BorderType.Heavy,
        [
          '┏━━━┓',
          '┃   ┃',
          '┗━━━┛'
        ]
      ],
      [
        'rounded',
        BorderType.Rounded,
        [
          '╭───╮',
          '│   │',
          '╰───╯'
        ]
      ],
    ])('creates %s border rectangle', (name, borderType, expected) => {
      expect(rectangle(5, 3, borderType)).toEqual(expected);
    });

    it.each([
      ['double', BorderType.Double, ['╔╗']],
      ['heavy', BorderType.Heavy, ['┏┓']],
      ['rounded', BorderType.Rounded, ['╭╮']],
    ])('applies %s border to 1x1 rectangle', (name, borderType, expected) => {
      expect(rectangle(1, 1, borderType)).toEqual(expected);
    });
  });
});

describe('line', () => {
  it.each([
    ['horizontal line', 5, true, ['─────']],
    [
      'vertical line',
      3,
      false,
      [
        '│',
        '│',
        '│'
      ]
    ],
    ['single cell horizontal', 1, true, ['─']],
    ['single cell vertical', 1, false, ['│']],
  ])('creates %s', (name, len, horizontal, expected) => {
    expect(line(len, horizontal)).toEqual(expected);
  });

  it.each([
    ['zero length horizontal', 0, true, ['']],
    ['zero length vertical', 0, false, []],
  ])('handles %s', (name, len, horizontal, expected) => {
    expect(line(len, horizontal)).toEqual(expected);
  });
});

describe('arrow', () => {
  it.each([
    ['right arrow', 5, LinearDirection.Right, ['────▶']],
    ['left arrow', 5, LinearDirection.Left, ['◀────']],
    [
      'up arrow',
      3,
      LinearDirection.Up,
      [
        '▲',
        '│',
        '│'
      ]
    ],
    [
      'down arrow',
      3,
      LinearDirection.Down,
      [
        '│',
        '│',
        '▼'
      ]
    ],
    ['single cell right', 1, LinearDirection.Right, ['▶']],
    ['single cell left', 1, LinearDirection.Left, ['◀']],
    ['single cell up', 1, LinearDirection.Up, ['▲']],
    ['single cell down', 1, LinearDirection.Down, ['▼']],
  ])('creates %s', (name, len, dir, expected) => {
    expect(arrow(len, dir)).toEqual(expected);
  });

  it('handles undecided direction', () => {
    expect(arrow(5, LinearDirection.Undecided)).toEqual(['']);
  });

  it('handles zero length', () => {
    expect(arrow(0, LinearDirection.Right)).toEqual(['']);
  });
});

describe('text', () => {
  it.each([
    ['simple text', 'Hello', ['Hello']],
    ['empty string', '', ['']],
    ['special characters', '┌─┐', ['┌─┐']],
  ])('creates %s', (name, content, expected) => {
    expect(text(content)).toEqual(expected);
  });
});

describe('polyline', () => {
  it('creates single segment horizontal line', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 130, y: 0 }
    ];
    
    expect(polyline(points)).toEqual(['──────────']);
  });

  it('creates single segment vertical line', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 60 }
    ];
    
    expect(polyline(points)).toEqual([
      '│',
      '│',
      '│'
    ]);
  });

  it('creates L-shape with corner', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 130, y: 0 },
      { x: 130, y: 60 }
    ];
    
    expect(polyline(points)).toEqual([
      '──────────┐',
      '          │',
      '          │',
      '          │'
    ]);
  });

  it('creates U-shape with two corners', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 60 },
      { x: 130, y: 60 },
      { x: 130, y: 0 }
    ];
    
    expect(polyline(points)).toEqual([
      '│         │',
      '│         │',
      '│         │',
      '└─────────┘'
    ]);
  });

  it('creates Z-shape', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 130, y: 0 },
      { x: 130, y: 60 },
      { x: 260, y: 60 }
    ];
    
    expect(polyline(points)).toEqual([
      '──────────┐          ',
      '          │          ',
      '          │          ',
      '          └──────────'
    ]);
  });

  it('creates stair pattern', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 52, y: 0 },
      { x: 52, y: 20 },
      { x: 104, y: 20 },
      { x: 104, y: 40 },
      { x: 156, y: 40 }
    ];
    
    expect(polyline(points)).toEqual([
      '────┐        ',
      '    └───┐    ',
      '        └────'
    ]);
  });

  it('handles empty points', () => {
    expect(polyline([])).toEqual(['']);
  });

  it('handles single point', () => {
    expect(polyline([{ x: 0, y: 0 }])).toEqual(['']);
  });
});

describe('polyarrow', () => {
  it('creates L-shape with end arrow', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 130, y: 0 },
      { x: 130, y: 60 }
    ];
    
    expect(polyarrow(points)).toEqual([
      '──────────┐',
      '          │',
      '          │',
      '          ▼'
    ]);
  });

  it('creates L-shape with start arrow', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 130, y: 0 },
      { x: 130, y: 60 }
    ];
    
    expect(polyarrow(points, true, false)).toEqual([
      '◀─────────┐',
      '          │',
      '          │',
      '          │'
    ]);
  });

  it('creates L-shape with both arrows', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 130, y: 0 },
      { x: 130, y: 60 }
    ];
    
    expect(polyarrow(points, true, true)).toEqual([
      '◀─────────┐',
      '          │',
      '          │',
      '          ▼'
    ]);
  });

  it('creates single segment with end arrow', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 130, y: 0 }
    ];
    
    expect(polyarrow(points)).toEqual(['─────────▶']);
  });

  it('creates single segment with both arrows', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 130, y: 0 }
    ];
    
    expect(polyarrow(points, true, true)).toEqual(['◀────────▶']);
  });

  it('creates vertical arrow down', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 60 }
    ];
    
    expect(polyarrow(points)).toEqual([
      '│',
      '│',
      '▼'
    ]);
  });
});
