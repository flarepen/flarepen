import { styled } from '../../stitches.config';
import { X_SCALE, Y_SCALE } from '../../constants';
import { Element, ElementType, isHorizontalArrow, isHorizontalLine } from '../../element';

function getDimensionString(element: Element) {
  switch (element.type) {
    case ElementType.Rectangle:
      return `${Math.abs(element.width)} x ${Math.abs(element.height)}`;
    case ElementType.Line:
      if (isHorizontalLine(element)) {
        return `${element.len} x 1`;
      } else {
        return `1 x ${element.len}`;
      }
    case ElementType.Arrow:
      if (isHorizontalArrow(element)) {
        return `${element.len} x 1`;
      } else {
        return `1 x ${element.len}`;
      }
    case ElementType.Text:
      return `${element.content.length} x 1`;
  }
}

function getPosition(element: Element) {
  switch (element.type) {
    case ElementType.Rectangle:
      return { left: element.x - X_SCALE, top: element.y - Y_SCALE - 6 };
    case ElementType.Line:
      if (isHorizontalLine(element)) {
        return { left: element.x - X_SCALE, top: element.y - Y_SCALE - 6 };
      } else {
        return { left: element.x - X_SCALE, top: element.y - 2 * Y_SCALE + 6 };
      }
    case ElementType.Arrow:
      if (isHorizontalArrow(element)) {
        return { left: element.x - X_SCALE, top: element.y - Y_SCALE - 6 };
      } else {
        return { left: element.x - X_SCALE, top: element.y - 2 * Y_SCALE + 6 };
      }
    case ElementType.Text:
      return { left: element.x - X_SCALE, top: element.y - Y_SCALE - 6 };
  }
}

interface DimensionIndicatorProps {
  className?: string;
  element: Element;
}

function DimensionIndicator({ className, element }: DimensionIndicatorProps) {
  const { left, top } = getPosition(element);

  const styles: React.CSSProperties = {
    position: 'absolute',
    left,
    top,
  };

  return (
    <div className={className} style={styles}>
      {getDimensionString(element)}
    </div>
  );
}

export default styled(DimensionIndicator, {
  padding: 0,
  margin: 0,
  color: '$secondary',
  userSelect: 'none',
});
