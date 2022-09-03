import create, { StateCreator } from 'zustand';
import { Tool } from './tools';
import { Element } from './element';
import produce from 'immer';
import _ from 'lodash';
import { Theme } from './types';
import { align, AlignType } from './align-utils';

// Handle state and actions for core app
interface AppSlice {
  elements: Element[];
  editingElement: null | Element;
  selectedIds: number[];
  tool: Tool;
  canvasCtx: null | CanvasRenderingContext2D;
  theme: Theme;
  showGrid: boolean;

  setElements: (elements: Element[], snapshot?: boolean) => void;
  updateElement: (id: number, update: (element: Element) => void) => void;
  deleteElement: (id: number, snapshot?: boolean) => void;

  setEditingElement: (element: null | Element) => void;

  select: (id: number, snapshot?: boolean) => void;
  unselect: (id: number, snapshot?: boolean) => void;
  resetSelected: (ids?: number[]) => void;

  setTool: (tool: Tool) => void;
  setCanvasCtx: (ctx: null | CanvasRenderingContext2D) => void;
  setTheme: (theme: Theme) => void;
  setShowGrid: (showGrid: boolean) => void;

  alignElements: (alignType: AlignType, snapshot?: boolean) => void;
}

const createAppSlice: StateCreatorFor<AppSlice> = (set, get) => ({
  elements: [],
  editingElement: null,
  selectedIds: [],
  tool: Tool.Rectangle,
  canvasCtx: null,
  theme: Theme.dark,
  showGrid: true,

  setElements: (elements, snapshot = true) => {
    if (snapshot) {
      get().snapshot();
    }
    set((state) => ({ elements }));
  },
  updateElement: (id, update) =>
    set(
      produce((state) => {
        const index = state.elements.findIndex((elem: Element) => elem.id === id);
        if (index !== -1) {
          update(state.elements[index]);
        }
      })
    ),
  deleteElement: (id, snapshot = true) => {
    snapshot && get().snapshot();

    set(
      produce((state) => {
        const index = state.elements.findIndex((elem: Element) => elem.id === id);
        if (index !== -1) {
          state.elements.splice(index, 1);
        }
      })
    );
  },

  setEditingElement: (element) => set((state) => ({ editingElement: element })),

  select: (id, snapshot = true) => {
    if (_.includes(get().selectedIds, id)) {
      return null;
    }

    snapshot && get().snapshot();

    set(
      produce((state) => {
        state.selectedIds.push(id);
      })
    );
  },
  unselect: (selectedId, snapshot = true) => {
    snapshot && get().snapshot();

    set(
      produce((state) => {
        const index = state.selectedIds.findIndex((id: number) => selectedId === id);
        if (index !== -1) {
          state.selectedIds.splice(index, 1);
        }
      })
    );
  },
  resetSelected: (ids, snapshot = true) => {
    snapshot && get().snapshot();

    set((state) => ({ selectedIds: ids }));
  },

  setTool: (tool: any) => set((_state) => ({ tool })),
  setCanvasCtx: (ctx) => set((_state) => ({ canvasCtx: ctx })),

  setTheme: (theme: Theme) => set((_state) => ({ theme })),
  setShowGrid: (showGrid: boolean) => set((_state) => ({ showGrid })),

  alignElements: (alignType, snapshot = true) => {
    snapshot && get().snapshot();

    set(
      produce((state) => {
        const selectedElements = _.filter(state.elements, (element) =>
          _.includes(state.selectedIds, element.id)
        );

        align(selectedElements, alignType);
      })
    );
  },
});

// Handle state and actions for Undo Redo

type Snapshot = Pick<AppSlice, 'elements' | 'selectedIds'>;

interface UndoSlice {
  past: Snapshot[];
  future: Snapshot[];

  snapshot: () => void;
  undo: () => void;
  redo: () => void;
}

const createUndoSlice: StateCreatorFor<UndoSlice> = (set) => ({
  past: [],
  future: [],

  snapshot: () => {
    set(
      produce((state) => {
        state.past.push({ elements: state.elements, selectedIds: state.selectedIds });
        state.future = [];
      })
    );
  },
  undo: () => {
    set(
      produce((state) => {
        // Fetch past snapshot
        const lastSnapshot = state.past.pop();
        if (lastSnapshot) {
          // Push current snapshot to future
          state.future.push({ elements: state.elements, selectedIds: state.selectedIds });
          // Apply past snapshot
          state.elements = lastSnapshot.elements;
          state.selectedIds = lastSnapshot.selectedIds;
        }
      })
    );
  },
  redo: () => {
    set(
      produce((state) => {
        // Fetch future snapshot
        const nextSnapshot = state.future.pop();
        if (nextSnapshot) {
          // Push current snapshot to past
          state.past.push({ elements: state.elements, selectedIds: state.selectedIds });
          // Apply future snapshot
          state.elements = nextSnapshot.elements;
          state.selectedIds = nextSnapshot.selectedIds;
        }
      })
    );
  },
});

// Wire up Everything

type AllSlices = AppSlice & UndoSlice;

type StateCreatorFor<T> = StateCreator<AllSlices, [], [], T>;

export const useStore = create<AllSlices>()((...a) => ({
  ...createAppSlice(...a),
  ...createUndoSlice(...a),
}));
