import produce from 'immer';
import _ from 'lodash';
import { X_SCALE, Y_SCALE } from '../../constants';
import { Element } from '../../element';
import { AppState, useStore } from '../store';
import { snapshot } from './undo';

function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

export const addElement = (element: Element, doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState(
    produce<AppState>((state) => {
      state.elements[element.id] = element;
    })
  );
};

export const updateElement = (
  id: string,
  update: (element: Element) => void | Element,
  doSnapshot = false
) => {
  doSnapshot && snapshot();

  if (typeof update === 'function') {
    useStore.setState(
      produce<AppState>((state) => {
        update(state.elements[id]);
      })
    );
  } else {
    useStore.setState(
      produce<AppState>((state) => {
        state.elements[id] = update;
      })
    );
  }
};

export const deleteElement = (id: string, doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState(
    produce<AppState>((state) => {
      delete state.elements[id];
    })
  );
};

export const setDraft = (draft: Element | null) => {
  useStore.setState((state) => ({ draft }));
};

export const shiftElements = (x_by: number, y_by: number) => {
  useStore.setState(
    produce<AppState>((state) => {
      const elementIds = _.keys(state.elements);
      elementIds.forEach((elementId) => {
        state.elements[elementId].x = state.elements[elementId].x + x_by;
        state.elements[elementId].y = state.elements[elementId].y + y_by;
      });
    })
  );
};

export const sanitizeElements = (doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState(
    produce<AppState>((state) => {
      const elementIds = _.keys(state.elements);
      elementIds.forEach((elementId) => {
        let element = state.elements[elementId];
        element.x = clipToScale(element.x, X_SCALE);
        element.y = clipToScale(element.y, Y_SCALE);
      });
    })
  );
};
