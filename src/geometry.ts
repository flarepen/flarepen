import { ArrowDirection } from './element'

export type Row = string
export type Shape = Row[]

const SYMBOLS = {
  LEFT_TOP: '┌',
  RIGHT_TOP: '┐',
  LEFT_BOTTOM: '└',
  RIGHT_BOTTOM: '┘',
  HORIZONTAL: '─',
  VERTICAL: '│',
  ARROW_LEFT: '◀',
  ARROW_RIGHT: '▶',
  ARROW_UP: '▲',
  ARROW_DOWN: '▼',
}

// TODO: Add better validations and edge case handling
export function rectangle(width: number, height: number): Shape {
  const shape = []
  // Top
  shape.push(
    SYMBOLS.LEFT_TOP +
      (width - 2 > 0 ? SYMBOLS.HORIZONTAL.repeat(width - 2) : '') +
      SYMBOLS.RIGHT_TOP
  )
  // Mids
  if (height - 2 > 0) {
    for (let i = height - 2; i > 0; i--) {
      shape.push(SYMBOLS.VERTICAL + (width - 2 > 0 ? ' '.repeat(width - 2) : '') + SYMBOLS.VERTICAL)
    }
  }
  // Bottom
  shape.push(
    SYMBOLS.LEFT_BOTTOM +
      (width - 2 > 0 ? SYMBOLS.HORIZONTAL.repeat(width - 2) : '') +
      SYMBOLS.RIGHT_BOTTOM
  )
  return shape
}

export function line(len: number, horizontal: boolean): Shape {
  if (horizontal) {
    return [SYMBOLS.HORIZONTAL.repeat(len)]
  }
  return Array(len).fill(SYMBOLS.VERTICAL)
}

export function arrow(len: number, direction: ArrowDirection): Shape {
  let shape = []
  switch (direction) {
    case ArrowDirection.Right:
      return [line(len - 1, true)[0] + SYMBOLS.ARROW_RIGHT]
    case ArrowDirection.Left:
      return [SYMBOLS.ARROW_LEFT + line(len - 1, true)[0]]
    case ArrowDirection.Up:
      shape = line(len - 1, false)
      shape.unshift(SYMBOLS.ARROW_UP)
      return shape
    case ArrowDirection.Down:
      shape = line(len - 1, false)
      shape.push(SYMBOLS.ARROW_DOWN)
      return shape
    case ArrowDirection.Undecided:
      return ['']
  }
}
