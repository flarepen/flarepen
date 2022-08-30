import create, { StateCreator } from 'zustand';
import { Tool } from './tools';
import { Element } from './element';
import produce from 'immer';

// Handle state and actions for core app
interface AppSlice {
  elements: Element[];
  selectedId: null | number;
  tool: Tool;
  canvasCtx: null | CanvasRenderingContext2D;

  setElements: (elements: Element[], snapshot?: boolean) => void;
  updateElement: (id: number, update: (element: Element) => void) => void;
  deleteElement: (id: number) => void;
  setSelectedId: (id: null | number, snapshot?: boolean) => void;

  setTool: (tool: Tool) => void;
  setCanvasCtx: (ctx: null | CanvasRenderingContext2D) => void;
}

const createAppSlice: StateCreatorFor<AppSlice> = (set, get) => ({
  elements: [],
  selectedId: null,
  tool: Tool.Rectangle,
  canvasCtx: null,

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
  deleteElement: (id) =>
    set(
      produce((state) => {
        const index = state.elements.findIndex((elem: Element) => elem.id === id);
        if (index !== -1) {
          state.elements.splice(index, 1);
        }
      })
    ),
  setSelectedId: (id, snapshot = true) => {
    if (snapshot) {
      get().snapshot();
    }
    set((_state) => ({ selectedId: id }));
  },

  setTool: (tool: any) => set((_state) => ({ tool })),
  setCanvasCtx: (ctx) => set((_state) => ({ canvasCtx: ctx })),
});

// Handle state and actions for Undo Redo

type Snapshot = Pick<AppSlice, 'elements' | 'selectedId'>;

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
        state.past.push({ elements: state.elements, selectedId: state.selectedId });
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
          state.future.push({ elements: state.elements, selectedId: state.selectedId });
          // Apply past snapshot
          state.elements = lastSnapshot.elements;
          state.selectedId = lastSnapshot.selectedId;
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
          state.past.push({ elements: state.elements, selectedId: state.selectedId });
          // Apply future snapshot
          state.elements = nextSnapshot.elements;
          state.selectedId = nextSnapshot.selectedId;
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
