import create, { StateCreator } from 'zustand';
import { Element } from '../element';
import produce from 'immer';
import _ from 'lodash';
import { Theme } from '../types';
import { Tool } from '../tools';

export interface AppSlice {
  elements: Element[];
  editingElement: null | Element;
  selectedIds: number[];
  tool: Tool;
  canvasCtx: null | CanvasRenderingContext2D;
  theme: Theme;
  showGrid: boolean;
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
