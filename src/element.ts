// TODO: Use it instead of x,y in other places
export interface Point {
  x: number;
  y: number;
}

export function point(x: number, y: number): Point {
  return { x, y };
}

interface ElementCommons {
  id: number;
  x: number;
  y: number;
  shape: string[];
}

export enum ElementType {
  Rectangle = 'rectangle',
  Line = 'line',
  Arrow = 'arrow',
  Text = 'text,',
}

// Rectangle

export interface Rectangle extends ElementCommons {
  width: number;
  height: number;
  type: ElementType.Rectangle;
}

// Line

export enum LineDirection {
  Horizontal,
  Vertical,
  Undecided,
}

export interface Line extends ElementCommons {
  len: number;
  direction: LineDirection;
  type: ElementType.Line;
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
  len: number;
  direction: ArrowDirection;
  type: ElementType.Arrow;
}

// Text

export interface Text extends ElementCommons {
  content: string;
  type: ElementType.Text;
}

// Supported Elements

export type Element = Rectangle | Line | Arrow | Text;
