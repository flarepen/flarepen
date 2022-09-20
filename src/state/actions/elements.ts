import produce from 'immer';
import _ from 'lodash';
import { X_SCALE, Y_SCALE } from '../../constants';
import { Element } from '../../element';
import { AppState, useStore } from '../store';
import { snapshot } from './undo';

function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

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

export const shiftElements = (x_by: number, y_by: number) => {
  useStore.setState(
    produce<AppState>((state) => {
      state.elements.forEach((element) => {
        element.x = element.x + x_by;
        element.y = element.y + y_by;
      });
    })
  );
};

export const sanitizeElements = (doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState(
    produce<AppState>((state) => {
      state.elements.forEach((element) => {
        element.x = clipToScale(element.x, X_SCALE);
        element.y = clipToScale(element.y, Y_SCALE);
      });
    })
  );
};
