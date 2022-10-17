import create, { StateCreator } from 'zustand';
import { Element } from '../element';
import _ from 'lodash';
import {
  EditingContext,
  ISelectionBox,
  Theme,
  CanvasDrag,
  ElementGroup,
  ElementToGroupMap,
  SelectionBoxStatus,
} from '../types';
import { Tool } from '../tools';

export interface IDimensions {
  width: number;
  height: number;
}

export interface Elements {
  [id: string]: Element;
}

export interface Groups {
  [id: string]: ElementGroup;
}

export interface AppSlice {
  elements: Elements;
  draft: null | Element;
  editingContext: EditingContext;
  selectedIds: string[];
  dragging: boolean;
  tool: Tool;
  canvasCtx: null | CanvasRenderingContext2D;
  theme: Theme;
  showGrid: boolean;
  dimensions: IDimensions;
  selectionBox: ISelectionBox;
  canvasDrag: CanvasDrag;
  spacePressed: boolean;

  groups: Groups;
  groupForElement: ElementToGroupMap;
  selectedGroupIds: string[];
}

export type AppState = AppSlice & UndoSlice;

const defaultSelectionBoxStatus: SelectionBoxStatus = 'inactive';
const defaultCanvasDrag: CanvasDrag = 'inactive';

export const getDefaultState = () => {
  return {
    elements: {},
    editingContext: { id: null, handleType: null },
    draft: null,
    selectedIds: [],
    dragging: false,
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
      status: defaultSelectionBoxStatus,
    },
    canvasDrag: defaultCanvasDrag,
    spacePressed: false,
    groups: {},
    groupForElement: {},
    selectedGroupIds: [],
  };
};

const createAppSlice: StateCreatorFor<AppSlice> = (set, get) => getDefaultState();

// Handle state and actions for Undo Redo

export type Snapshot = Pick<
  AppSlice,
  'elements' | 'selectedIds' | 'groups' | 'groupForElement' | 'selectedGroupIds'
>;

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
