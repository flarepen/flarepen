interface ElementCommons {
  x: number
  y: number
  shape: string[]
}

export enum ElementType {
  Rectangle = 'rectangle',
  Line = 'line',
  Arrow = 'Arrow',
}

// Rectangle

export interface Rectangle extends ElementCommons {
  width: number
  height: number
  type: ElementType.Rectangle
}

// Line

export enum LineDirection {
  Horizontal,
  Vertical,
  Undecided,
}

export interface Line extends ElementCommons {
  len: number
  direction: LineDirection
  type: ElementType.Line
}

// Arrow

export enum ArrowDirection {
  Left,
  Right,
  Up,
  Down,
  Undecided,
}

export interface Arrow extends ElementCommons {
  len: number
  direction: ArrowDirection
  type: ElementType.Arrow
}

// Supported Elements

export type Element = Rectangle | Line | Arrow
