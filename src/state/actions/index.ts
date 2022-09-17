import { Tool } from '../../tools';
import { ISelectionBox, Theme } from '../../types';
import { IDimensions, useStore } from '../store';

export * from './undo';
export * from './align';
export * from './select';
export * from './elements';

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
