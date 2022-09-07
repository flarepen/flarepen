import produce from 'immer';
import _ from 'lodash';
import { Element } from '../../element';
import { AppState, useStore } from '../store';
import { snapshot } from './undo';

export const setElements = (elements: Element[], doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState((state) => ({ elements }));
};

export const updateElement = (id: number, update: (element: Element) => void) => {
  useStore.setState(
    produce<AppState>((state) => {
      const index = state.elements.findIndex((elem: Element) => elem.id === id);
      if (index !== -1) {
        update(state.elements[index]);
      }
    })
  );
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

export const setEditingElement = (element: Element | null) => {
  useStore.setState((state) => ({ editingElement: element }));
};
