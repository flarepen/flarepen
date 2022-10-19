import produce from 'immer';
import _ from 'lodash';
import { X_SCALE, Y_SCALE } from '../../constants';
import { Element } from '../../element';
import { elementID, groupIDGenerator } from '../../id';
import { Tool } from '../../tools';
import { CanvasDrag, EditingContext, IMouseMove, ISelectionBox, Theme } from '../../types';
import { parse } from '../parse';
import { AppState, Elements, getDefaultState, IDimensions, useStore } from '../store';

export * from './undo';
export * from './align';
export * from './select';
export * from './elements';
export * from './group';

export const setShowGrid = (show: boolean) => {
  useStore.setState((_state) => ({ showGrid: show }));
};

export const setTheme = (theme: Theme) => {
  useStore.setState((_state) => ({ theme }));
};

export const setCanvasCtx = (ctx: null | CanvasRenderingContext2D) => {
  useStore.setState((_state) => ({ canvasCtx: ctx }));
};

export const setTool = (tool: Tool) => {
  useStore.setState((_state) => ({ tool }));
};

export const setDimensions = (dimensions: IDimensions) => {
  useStore.setState((_state) => ({ dimensions }));
};

export const setSelectionBox = (updates: Partial<ISelectionBox>) => {
  useStore.setState((state) => ({ selectionBox: { ...state.selectionBox, ...updates } }));
};

export const setEditingContext = (updates: Partial<EditingContext>) => {
  useStore.setState((state) => ({ editingContext: { ...state.editingContext, ...updates } }));
};

export const setDragging = (dragging: boolean) => {
  useStore.setState((state) => ({ dragging }));
};

export const setCanvasDrag = (canvasDrag: CanvasDrag) => {
  useStore.setState((state) => ({ canvasDrag }));
};

export const setSpacePressed = (spacePressed: boolean) => {
  useStore.setState((state) => ({ spacePressed }));
};

export const drag = (mouseMove: IMouseMove) => {
  const xBy =
    mouseMove.currentEvent!.clientX -
    (mouseMove.previousEvent ? mouseMove.previousEvent.clientX : 0);
  const yBy =
    mouseMove.currentEvent!.clientY -
    (mouseMove.previousEvent ? mouseMove.previousEvent.clientY : 0);

  useStore.setState(
    produce<AppState>((state) => {
      // Move Groups
      state.selectedGroupIds.forEach((groupId) => {
        state.groups[groupId].elementIds.forEach((elementId) => {
          state.elements[elementId].x = state.elements[elementId].x + xBy;
          state.elements[elementId].y = state.elements[elementId].y + yBy;
        });
      });

      // Move Elements
      state.selectedIds.forEach((elementId) => {
        state.elements[elementId].x = state.elements[elementId].x + xBy;
        state.elements[elementId].y = state.elements[elementId].y + yBy;
      });
    })
  );
};

export function importToCanvas(objs: any[]) {
  let elements = {};
  try {
    elements = _.reduce(
      objs,
      (acc, obj) => {
        const element = parse(obj);
        element.x = element.x * X_SCALE;
        element.y = element.y * Y_SCALE;
        acc[element.id] = element;
        return acc;
      },
      {} as Elements
    );
  } catch (ElementParseError) {
    console.log('Cannot parse Elements');
  }

  console.log(elements);
  if (elements) {
    useStore.setState((state) => ({
      elements,
      editingContext: { id: null, handleType: null },
      draft: null,
      selectedIds: [],
      groups: {},
      groupForElement: {},
      selectedGroupIds: [],
    }));

    groupIDGenerator.setID(0);
    elementID.setID(
      _.max(
        _.map(objs, (obj) => {
          const id: string = obj['id'] as string;
          return parseInt(id.substring(1));
        })
      )
    );
  }
}
