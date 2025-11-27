import create, { StateCreator } from 'zustand';
import { Element } from '../element';
import _ from 'lodash';
import {
  Theme,
  ElementGroup,
  ElementToGroupMap,
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
  selectedIds: string[];
  dragging: boolean;
  tool: Tool;
  canvasCtx: null | CanvasRenderingContext2D;
  theme: Theme;
  showGrid: boolean;
  dimensions: IDimensions;
  spacePressed: boolean;
  toolLocked: boolean;
  currentCell: null | Point;
  hoveredElementId: null | string;
  cursor: string;

  groups: Groups;
  groupForElement: ElementToGroupMap;
  selectedGroupIds: string[];
  clipboard: ClipBoard;

  // New state machine (alongside old flags during migration)
  interactionMode: InteractionMode;
}

export type AppState = AppSlice & UndoSlice;

export const getDefaultState = () => {
  return {
    elements: {},
    draft: null,
    selectedIds: [],
    dragging: false,
    tool: Tool.Rectangle,
    canvasCtx: null,
    theme: Theme.light,
    showGrid: true,
    dimensions: {
      width: window.innerWidth,
      height: window.innerHeight - 48, // Subtract toolbar height
    },
    spacePressed: false,
    toolLocked: false,
    currentCell: null,
    hoveredElementId: null,
    cursor: 'default',
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
