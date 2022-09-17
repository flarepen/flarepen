import create, { StateCreator } from 'zustand';
import { Element, IBounds } from '../element';
import produce from 'immer';
import _ from 'lodash';
import { ISelectionBox, Theme } from '../types';
import { Tool } from '../tools';

export interface IDimensions {
  width: number;
  height: number;
}

export interface AppSlice {
  elements: Element[];
  editingElement: null | Element;
  selectedIds: number[];
  tool: Tool;
  canvasCtx: null | CanvasRenderingContext2D;
  theme: Theme;
  showGrid: boolean;
  dimensions: IDimensions;
  selectionBox: ISelectionBox;
}

export type AppState = AppSlice & UndoSlice;

const createAppSlice: StateCreatorFor<AppSlice> = (set, get) => ({
  elements: [],
  editingElement: null,
  selectedIds: [],
  tool: Tool.Rectangle,
  canvasCtx: null,
  theme: Theme.dark,
  showGrid: true,
  dimensions: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  selectionBox: {
    bounds: null,
    status: 'inactive',
  },
});

// Handle state and actions for Undo Redo

export type Snapshot = Pick<AppSlice, 'elements' | 'selectedIds'>;

export interface UndoSlice {
  past: Snapshot[];
  future: Snapshot[];
}

const createUndoSlice: StateCreatorFor<UndoSlice> = (set) => ({
  past: [],
  future: [],
});

// Wire up Everything

type StateCreatorFor<T> = StateCreator<AppState, [], [], T>;

export const useStore = create<AppState>()((...a) => ({
  ...createAppSlice(...a),
  ...createUndoSlice(...a),
}));
