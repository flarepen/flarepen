import produce from 'immer';
import _ from 'lodash';
import { Element } from '../../element';
import { AppState, useStore } from '../store';
import { snapshot } from './undo';

export const setElements = (elements: Element[], doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState((state) => ({ elements }));
};

export const updateElement = (id: number, update: (element: Element) => void | Element) => {
  if (typeof update === 'function') {
    useStore.setState(
      produce<AppState>((state) => {
        const index = state.elements.findIndex((elem: Element) => elem.id === id);
        if (index !== -1) {
          update(state.elements[index]);
        }
      })
    );
  } else {
    useStore.setState(
      produce<AppState>((state) => {
        const index = state.elements.findIndex((elem: Element) => elem.id === id);
        if (index !== -1) {
          state.elements[index] = update;
        }
      })
    );
  }
};

export const deleteElement = (id: number, doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState(
    produce<AppState>((state) => {
      const index = state.elements.findIndex((elem: Element) => elem.id === id);
      if (index !== -1) {
        state.elements.splice(index, 1);
      }
    })
  );
};

export const setDraft = (draft: Element | null) => {
  useStore.setState((state) => ({ draft }));
};
