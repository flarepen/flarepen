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
  Point,
  Draft,
  InteractionMode,
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

// Custom clipboard to copy elements and groups
export interface ClipBoard {
  elementIds: string[];
  elements: Element[];
  groups: ElementGroup[];
}

export interface AppSlice {
  elements: Elements;
  draft: null | Draft;
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
  toolLocked: boolean;
  currentCell: null | Point;

  groups: Groups;
  groupForElement: ElementToGroupMap;
  selectedGroupIds: string[];
  clipboard: ClipBoard;

  // New state machine (alongside old flags during migration)
  interactionMode: InteractionMode;
}

export type AppState = AppSlice & UndoSlice;

const defaultSelectionBoxStatus: SelectionBoxStatus = 'inactive';
const defaultCanvasDrag: CanvasDrag = 'inactive';

export const getDefaultState = () => {
  return {
    elements: {},
    editingContext: { id: null, handleId: null },
    draft: null,
    selectedIds: [],
    dragging: false,
    tool: Tool.Rectangle,
    canvasCtx: null,
    theme: Theme.light,
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
    toolLocked: false,
    currentCell: null,
    groups: {},
    groupForElement: {},
    selectedGroupIds: [],
    clipboard: { elementIds: [], elements: [], groups: [] },
    interactionMode: { type: 'idle' } as InteractionMode,
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
