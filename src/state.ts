import create from 'zustand';
import { Element } from './element';

export interface AppState {
  elements: Element[];
  setElements: (elements: Element[]) => void;
}

export const useStore = create<AppState>()((set) => ({
  elements: [],
  setElements: (elements) => set(() => ({ elements })),
}));
