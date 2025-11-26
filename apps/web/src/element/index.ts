import { Line, LineHandler } from './line';
import { Arrow, ArrowHandler } from './arrow';
import { Text, TextHandler } from './text';
import { Rectangle, RectangleHandler } from './rectangle';
import { ElementType, ElementHandler, IBounds, Point } from './base';

export type Element = Rectangle | Line | Arrow | Text;

export function createElement(type: ElementType, x: number, y: number): Element {
  switch (type) {
    case ElementType.Rectangle:
      return RectangleHandler.new(x, y);
    case ElementType.Arrow:
      return ArrowHandler.new(x, y);
    case ElementType.Line:
      return LineHandler.new(x, y);
    case ElementType.Text:
      return TextHandler.new(x, y);
  }
}

export const ElementHandlerMap: { [k in ElementType]: ElementHandler<any> } = {
  [ElementType.Rectangle]: RectangleHandler,
  [ElementType.Arrow]: ArrowHandler,
  [ElementType.Line]: LineHandler,
  [ElementType.Text]: TextHandler,
};

export function handlerFor(element: Element): ElementHandler<any> {
  return ElementHandlerMap[element.type];
}

// Legacy alias for backward compatibility
export const utilFor = handlerFor;

export function inVicinity(p: Point, element: Element): boolean {
  return handlerFor(element).inVicinity(element, p);
}

export function insideBound(element: Element, bound: IBounds): boolean {
  const outlineBounds = ElementHandlerMap[element.type].outlineBounds(element);
  return (
    bound.x < outlineBounds.x &&
    bound.y < outlineBounds.y &&
    bound.x + Math.abs(bound.width) > outlineBounds.x + outlineBounds.width &&
    bound.y + Math.abs(bound.height) > outlineBounds.y + outlineBounds.height
  );
}

export * from './base';
export * from './line';
export * from './arrow';
export * from './text';
export * from './rectangle';
export * from './linear';
