import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import _, { max } from 'lodash';
import { X_SCALE, Y_SCALE } from '../../constants';
import { Element, ElementType, isHorizontalArrow, isHorizontalLine } from '../../element';
import { ElementGroup } from '../../types';
import { AppState, Elements, useStore } from '../store';
import { snapshot } from './undo';

export type AlignType = 'left' | 'right' | 'center_x' | 'top' | 'bottom' | 'center_y';

type AlignFunc = (state: WritableDraft<AppState>) => void;

// TODO: Cleanup all this after making Group a first class element

type CachedGroup = {
  id: string;
  elementIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
};

function getCachedGroup(elements: Elements, group: ElementGroup): CachedGroup {
  const x = Math.min(..._.map(group.elementIds, (elementId) => elements[elementId].x));
  const y = Math.min(..._.map(group.elementIds, (elementId) => elements[elementId].y));

  const xMax = Math.max(
    ..._.map(
      group.elementIds,
      (elementId) => elements[elementId].x + width(elements[elementId]) * X_SCALE
    )
  );

  const yMax = Math.max(
    ..._.map(
      group.elementIds,
      (elementId) => elements[elementId].y + height(elements[elementId]) * Y_SCALE
    )
  );

  return {
    id: group.id,
    elementIds: group.elementIds,
    x,
    y,
    width: (xMax - x) / X_SCALE,
    height: (yMax - y) / Y_SCALE,
  };
}

type ElementOrGroup = Element | CachedGroup;

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

function moveGroupX(elements: Elements, group: CachedGroup, newX: number) {
  const oldX = group.x;
  const diff = newX - oldX;
  group.elementIds.forEach((elementId) => {
    elements[elementId].x = elements[elementId].x + diff;
  });
}

function moveGroupY(elements: Elements, group: CachedGroup, newY: number) {
  const oldY = group.y;
  const diff = newY - oldY;
  group.elementIds.forEach((elementId) => {
    elements[elementId].y = elements[elementId].y + diff;
  });
}

const alignLeft: AlignFunc = (state) => {
  const selectedElements = _.map(state.selectedIds, (selectedId) => state.elements[selectedId]);
  const selectedGroups = _.map(state.selectedGroupIds, (selectedId) =>
    getCachedGroup(state.elements, state.groups[selectedId])
  );

  const xMin = Math.min(
    Math.min(...selectedElements.map((element) => element.x)),
    Math.min(...selectedGroups.map((group) => group.x))
  );

  selectedElements.forEach((element) => {
    element.x = xMin;
  });

  selectedGroups.forEach((group) => {
    moveGroupX(state.elements, group, xMin);
  });
};

const alignRight: AlignFunc = (state) => {
  const selectedElements = _.map(state.selectedIds, (selectedId) => state.elements[selectedId]);
  const selectedGroups = _.map(state.selectedGroupIds, (selectedId) =>
    getCachedGroup(state.elements, state.groups[selectedId])
  );

  const xMax = Math.max(
    Math.max(...selectedElements.map((element) => element.x + width(element) * X_SCALE)),
    Math.max(...selectedGroups.map((group) => group.x + group.width * X_SCALE))
  );

  selectedElements.forEach((element) => {
    element.x = xMax - width(element) * X_SCALE;
  });

  selectedGroups.forEach((group) => {
    moveGroupX(state.elements, group, xMax - group.width * X_SCALE);
  });
};

const alignTop: AlignFunc = (state) => {
  const selectedElements = _.map(state.selectedIds, (selectedId) => state.elements[selectedId]);
  const selectedGroups = _.map(state.selectedGroupIds, (selectedId) =>
    getCachedGroup(state.elements, state.groups[selectedId])
  );

  const yMin = Math.min(
    Math.min(...selectedElements.map((element) => element.y)),
    Math.min(...selectedGroups.map((group) => group.y))
  );

  selectedElements.forEach((element) => {
    element.y = yMin;
  });

  selectedGroups.forEach((group) => {
    moveGroupY(state.elements, group, yMin);
  });
};

const alignBottom: AlignFunc = (state) => {
  const selectedElements = _.map(state.selectedIds, (selectedId) => state.elements[selectedId]);
  const selectedGroups = _.map(state.selectedGroupIds, (selectedId) =>
    getCachedGroup(state.elements, state.groups[selectedId])
  );

  const yMax = Math.max(
    Math.max(...selectedElements.map((element) => element.y + height(element) * Y_SCALE)),
    Math.max(...selectedGroups.map((group) => group.y + group.height * Y_SCALE))
  );

  selectedElements.forEach((element) => {
    element.y = yMax - height(element) * Y_SCALE;
  });

  selectedGroups.forEach((group) => {
    moveGroupY(state.elements, group, yMax - group.height * Y_SCALE);
  });
};

const alignCenterX: AlignFunc = (state) => {
  const selectedElements = _.map(state.selectedIds, (selectedId) => state.elements[selectedId]);
  const selectedGroups = _.map(state.selectedGroupIds, (selectedId) =>
    getCachedGroup(state.elements, state.groups[selectedId])
  );

  const maxElement = _.maxBy(selectedElements, (element) => width(element));
  const maxGroup = _.maxBy(selectedGroups, (group) => group.width);

  let maxWidth = 0;
  let reference: ElementOrGroup | null = null;

  if (!maxElement) {
    maxWidth = maxGroup!.width;
    reference = maxGroup!;
  } else if (!maxGroup) {
    maxWidth = width(maxElement!);
    reference = maxElement!;
  } else {
    maxWidth = Math.max(width(maxElement!), maxGroup!.width);
    reference = width(maxElement!) > maxGroup!.width ? maxElement! : maxGroup!;
  }

  selectedElements.forEach((element) => {
    const widthDiff = maxWidth - width(element);
    element.x = reference!.x + Math.floor(widthDiff / 2) * X_SCALE;
  });

  selectedGroups.forEach((group) => {
    const widthDiff = maxWidth - group.width;
    moveGroupX(state.elements, group, reference!.x + Math.floor(widthDiff / 2) * X_SCALE);
  });
};

const alignCenterY: AlignFunc = (state) => {
  const selectedElements = _.map(state.selectedIds, (selectedId) => state.elements[selectedId]);
  const selectedGroups = _.map(state.selectedGroupIds, (selectedId) =>
    getCachedGroup(state.elements, state.groups[selectedId])
  );

  const maxElement = _.maxBy(selectedElements, (element) => height(element));
  const maxGroup = _.maxBy(selectedGroups, (group) => group.height);

  let maxHeight = 0;
  let reference: ElementOrGroup | null = null;

  if (!maxElement) {
    maxHeight = maxGroup!.height;
    reference = maxGroup!;
  } else if (!maxGroup) {
    maxHeight = height(maxElement!);
    reference = maxElement!;
  } else {
    maxHeight = Math.max(height(maxElement!), maxGroup!.height);
    reference = height(maxElement!) > maxGroup!.height ? maxElement! : maxGroup!;
  }

  selectedElements.forEach((element) => {
    const heightDiff = maxHeight - height(element);
    element.y = reference!.y + Math.floor(heightDiff / 2) * Y_SCALE;
  });

  selectedGroups.forEach((group) => {
    const heightDiff = maxHeight - group.height;
    moveGroupY(state.elements, group, reference!.y + Math.floor(heightDiff / 2) * Y_SCALE);
  });
};

const alignTypeToFunc: { [K in AlignType]: AlignFunc } = {
  left: alignLeft,
  right: alignRight,
  center_x: alignCenterX,
  top: alignTop,
  bottom: alignBottom,
  center_y: alignCenterY,
};

function align(alignType: AlignType, state: WritableDraft<AppState>) {
  alignTypeToFunc[alignType] && alignTypeToFunc[alignType](state);
}

export const alignElements = (alignType: AlignType, doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState(
    produce<AppState>((state) => {
      align(alignType, state);
    })
  );
};
