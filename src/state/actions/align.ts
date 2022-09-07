import produce from 'immer';
import _ from 'lodash';
import { X_SCALE, Y_SCALE } from '../../constants';
import { Element, ElementType, isHorizontalArrow, isHorizontalLine } from '../../element';
import { AppState, useStore } from '../store';
import { snapshot } from './undo';

export type AlignType = 'left' | 'right' | 'center_x' | 'top' | 'bottom' | 'center_y';

//TODO: Move to Element classes
function width(element: Element) {
  switch (element.type) {
    case ElementType.Rectangle:
      return element.width;
    case ElementType.Line:
      return isHorizontalLine(element) ? element.len : 1;
    case ElementType.Arrow:
      return isHorizontalArrow(element) ? element.len : 1;
    case ElementType.Text:
      return element.content.length;
  }
}

function height(element: Element) {
  switch (element.type) {
    case ElementType.Rectangle:
      return element.height;
    case ElementType.Line:
      return isHorizontalLine(element) ? 1 : element.len;
    case ElementType.Arrow:
      return isHorizontalArrow(element) ? 1 : element.len;
    case ElementType.Text:
      return 1;
  }
}

function alignLeft(elements: Element[]) {
  const xMin = Math.min(...elements.map((element) => element.x));
  elements.forEach((element) => {
    element.x = xMin;
  });
}

function alignRight(elements: Element[]) {
  const xMax = Math.max(...elements.map((element) => element.x + width(element) * X_SCALE));
  elements.forEach((element) => {
    element.x = xMax - width(element) * X_SCALE;
  });
}

function alignTop(elements: Element[]) {
  const yMin = Math.min(...elements.map((element) => element.y));
  elements.forEach((element) => {
    element.y = yMin;
  });
}

function alignBottom(elements: Element[]) {
  const yMax = Math.max(...elements.map((element) => element.y + height(element) * Y_SCALE));
  elements.forEach((element) => {
    element.y = yMax - height(element) * Y_SCALE;
  });
}

function alignCenterX(elements: Element[]) {
  const maxWidth = Math.max(...elements.map((element) => width(element)));
  const reference = _.find(elements, (element) => width(element) === maxWidth)!;
  elements.forEach((element) => {
    const widthDiff = maxWidth - width(element);
    element.x = reference.x + Math.floor(widthDiff / 2) * X_SCALE;
  });
}

function alignCenterY(elements: Element[]) {
  const maxHeight = Math.max(...elements.map((element) => height(element)));
  const reference = _.find(elements, (element) => height(element) === maxHeight)!;
  elements.forEach((element) => {
    const heightDiff = maxHeight - height(element);
    element.y = reference.y + Math.floor(heightDiff / 2) * Y_SCALE;
  });
}

function align(elements: Element[], alignType: AlignType) {
  switch (alignType) {
    case 'left':
      alignLeft(elements);
      break;
    case 'right':
      alignRight(elements);
      break;
    case 'center_x':
      alignCenterX(elements);
      break;
    case 'top':
      alignTop(elements);
      break;
    case 'bottom':
      alignBottom(elements);
      break;
    case 'center_y':
      alignCenterY(elements);
  }
}

export const alignElements = (alignType: AlignType, doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState(
    produce<AppState>((state) => {
      const selectedElements = _.filter(state.elements, (element) =>
        _.includes(state.selectedIds, element.id)
      );

      align(selectedElements, alignType);
    })
  );
};
