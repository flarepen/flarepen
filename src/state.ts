import create from 'zustand';
import { Tool } from './tools';
import { Element } from './element';
import produce from 'immer';
import _, { update } from 'lodash';

export interface AppState {
  elements: Element[];
  selectedId: null | number;
  tool: Tool;
  canvasCtx: null | CanvasRenderingContext2D;

  setElements: (elements: Element[]) => void;
  updateElement: (id: number, update: (element: Element) => void) => void;
  deleteElement: (id: number) => void;
  setSelectedId: (id: null | number) => void;
  setTool: (tool: Tool) => void;
  setCanvasCtx: (ctx: null | CanvasRenderingContext2D) => void;
}

export const useStore = create<AppState>()((set) => ({
  elements: [],
  selectedId: null,
  tool: Tool.Rectangle,
  canvasCtx: null,

  setElements: (elements) => set((_state) => ({ elements })),
  updateElement: (id, update) =>
    set(
      produce((state: AppState) => {
        const index = state.elements.findIndex((elem) => elem.id === id);
        if (index !== -1) {
          update(state.elements[index]);
        }
      })
    ),
  deleteElement: (id) =>
    set(
      produce((state: AppState) => {
        const index = state.elements.findIndex((elem) => elem.id === id);
        if (index !== -1) {
          state.elements.splice(index, 1);
        }
      })
    ),
  setSelectedId: (id) => set((_state) => ({ selectedId: id })),
  setTool: (tool) => set((_state) => ({ tool })),
  setCanvasCtx: (ctx) => set((_state) => ({ canvasCtx: ctx })),
}));
