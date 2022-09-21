import produce from 'immer';
import { Tool } from '../../tools';
import { CanvasDrag, EditingContext, IMouseMove, ISelectionBox, Theme } from '../../types';
import { AppState, IDimensions, useStore } from '../store';

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
