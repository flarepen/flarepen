import { describe, it, expect } from 'vitest';
import { rectangle, BorderType, line, arrow, LinearDirection, text, polyline, polyarrow } from '../shapes';

describe('rectangle', () => {
  it('creates a basic rectangle', () => {
    const result = rectangle(5, 3);
    
    expect(result.rows).toEqual([
      '┌───┐',
      '│   │',
      '└───┘'
    ]);
    expect(result.width).toBe(5);
    expect(result.height).toBe(3);
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
    expect(rectangle(width, height).rows).toEqual(expected);
  });

  it.each([
    ['zero width', 0, 3],
    ['zero height', 5, 0],
  ])('handles %s', (name, width, height) => {
    expect(rectangle(width, height).rows).toEqual(['']);
  });

  it('creates a large rectangle', () => {
    const result = rectangle(10, 5);
    
    expect(result.rows).toEqual([
      '┌────────┐',
      '│        │',
      '│        │',
      '│        │',
      '└────────┘'
    ]);
    expect(result.width).toBe(10);
    expect(result.height).toBe(5);
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
      expect(rectangle(5, 3, borderType).rows).toEqual(expected);
    });

    it.each([
      ['double', BorderType.Double, ['╔╗']],
      ['heavy', BorderType.Heavy, ['┏┓']],
      ['rounded', BorderType.Rounded, ['╭╮']],
    ])('applies %s border to 1x1 rectangle', (name, borderType, expected) => {
      expect(rectangle(1, 1, borderType).rows).toEqual(expected);
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
    expect(line(len, horizontal).rows).toEqual(expected);
  });

  it.each([
    ['zero length horizontal', 0, true, ['']],
    ['zero length vertical', 0, false, []],
  ])('handles %s', (name, len, horizontal, expected) => {
    expect(line(len, horizontal).rows).toEqual(expected);
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
    expect(arrow(len, dir).rows).toEqual(expected);
  });

  it('handles undecided direction', () => {
    expect(arrow(5, LinearDirection.Undecided).rows).toEqual(['']);
  });

  it('handles zero length', () => {
    expect(arrow(0, LinearDirection.Right).rows).toEqual(['']);
  });
});

describe('text', () => {
  it.each([
    ['simple text', 'Hello', ['Hello']],
    ['empty string', '', ['']],
    ['special characters', '┌─┐', ['┌─┐']],
  ])('creates %s', (name, content, expected) => {
    expect(text(content).rows).toEqual(expected);
  });
});

describe('polyline', () => {
  it('creates single segment horizontal line', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 10, row: 0 }
    ];
    
    const result = polyline(cells);
    expect(result.rows).toEqual(['──────────']);
    expect(result.width).toBe(10);
    expect(result.height).toBe(1);
  });

  it('creates single segment vertical line', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 0, row: 3 }
    ];
    
    const result = polyline(cells);
    expect(result.rows).toEqual([
      '│',
      '│',
      '│'
    ]);
    expect(result.width).toBe(1);
    expect(result.height).toBe(3);
  });

  it('creates L-shape with corner', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 10, row: 0 },
      { col: 10, row: 3 }
    ];
    
    const result = polyline(cells);
    expect(result.rows).toEqual([
      '──────────┐',
      '          │',
      '          │',
      '          │'
    ]);
  });

  it('creates U-shape with two corners', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 0, row: 3 },
      { col: 10, row: 3 },
      { col: 10, row: 0 }
    ];
    
    const result = polyline(cells);
    expect(result.rows).toEqual([
      '│         │',
      '│         │',
      '│         │',
      '└─────────┘'
    ]);
  });

  it('creates Z-shape', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 10, row: 0 },
      { col: 10, row: 3 },
      { col: 20, row: 3 }
    ];
    
    const result = polyline(cells);
    expect(result.rows).toEqual([
      '──────────┐          ',
      '          │          ',
      '          │          ',
      '          └──────────'
    ]);
  });

  it('creates stair pattern', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 4, row: 0 },
      { col: 4, row: 1 },
      { col: 8, row: 1 },
      { col: 8, row: 2 },
      { col: 12, row: 2 }
    ];
    
    const result = polyline(cells);
    expect(result.rows).toEqual([
      '────┐        ',
      '    └───┐    ',
      '        └────'
    ]);
  });

  it('handles empty cells', () => {
    const result = polyline([]);
    expect(result.rows).toEqual(['']);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });

  it('handles single cell', () => {
    const result = polyline([{ col: 0, row: 0 }]);
    expect(result.rows).toEqual(['']);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });
});

describe('polyarrow', () => {
  it('creates L-shape with end arrow', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 10, row: 0 },
      { col: 10, row: 3 }
    ];
    
    const result = polyarrow(cells);
    expect(result.rows).toEqual([
      '──────────┐',
      '          │',
      '          │',
      '          ▼'
    ]);
  });

  it('creates L-shape with start arrow', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 10, row: 0 },
      { col: 10, row: 3 }
    ];
    
    const result = polyarrow(cells, true, false);
    expect(result.rows).toEqual([
      '◀─────────┐',
      '          │',
      '          │',
      '          │'
    ]);
  });

  it('creates L-shape with both arrows', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 10, row: 0 },
      { col: 10, row: 3 }
    ];
    
    const result = polyarrow(cells, true, true);
    expect(result.rows).toEqual([
      '◀─────────┐',
      '          │',
      '          │',
      '          ▼'
    ]);
  });

  it('creates single segment with end arrow', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 10, row: 0 }
    ];
    
    const result = polyarrow(cells);
    expect(result.rows).toEqual(['─────────▶']);
  });

  it('creates single segment with both arrows', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 10, row: 0 }
    ];
    
    const result = polyarrow(cells, true, true);
    expect(result.rows).toEqual(['◀────────▶']);
  });

  it('creates vertical arrow down', () => {
    const cells = [
      { col: 0, row: 0 },
      { col: 0, row: 3 }
    ];
    
    const result = polyarrow(cells);
    expect(result.rows).toEqual([
      '│',
      '│',
      '▼'
    ]);
  });
});
