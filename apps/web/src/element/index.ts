import { Line, LineUtils } from './line';
import { Arrow, ArrowUtils } from './arrow';
import { Text, TextUtils } from './text';
import { Rectangle, RectangleUtils } from './rectangle';
import { ElementType, ElementUtils, IBounds, Point } from './base';

export type Element = Rectangle | Line | Arrow | Text;

export function createElement(type: ElementType, x: number, y: number): Element {
  switch (type) {
    case ElementType.Rectangle:
      return RectangleUtils.new(x, y);
    case ElementType.Arrow:
      return ArrowUtils.new(x, y);
    case ElementType.Line:
      return LineUtils.new(x, y);
    case ElementType.Text:
      return TextUtils.new(x, y);
  }
}

export const ElementUtilsMap: { [k in ElementType]: ElementUtils<any> } = {
  [ElementType.Rectangle]: RectangleUtils,
  [ElementType.Arrow]: ArrowUtils,
  [ElementType.Line]: LineUtils,
  [ElementType.Text]: TextUtils,
};

export function utilFor(element: Element): ElementUtils<any> {
  return ElementUtilsMap[element.type];
}

export function inVicinity(p: Point, element: Element): boolean {
  return utilFor(element).inVicinity(element, p);
}

export function insideBound(element: Element, bound: IBounds): boolean {
  const outlineBounds = ElementUtilsMap[element.type].outlineBounds(element);
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
