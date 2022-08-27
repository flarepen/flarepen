import create from 'zustand';
import { Element } from './element';

export interface AppState {
  elements: Element[];
  setElements: (elements: Element[]) => void;
  selectedElement: null | Element;
  setSelectedElement: (element: null | Element) => void;
}

export const useStore = create<AppState>()((set) => ({
  elements: [],
  setElements: (elements) => set((_state) => ({ elements })),
  selectedElement: null,
  setSelectedElement: (element) => set((_state) => ({ selectedElement: element })),
}));
