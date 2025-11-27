import produce from 'immer';
import _ from 'lodash';
import { X_SCALE, Y_SCALE } from '../../constants';
import { Element } from '../../element';
import { elementIDGenerator, groupIDGenerator } from '../../id';
import { Tool } from '../../tools';
import { MouseMove, Point, Theme } from '../../types';
import { parse } from '../parse';
import { AppState, Elements, getDefaultState, IDimensions, useStore } from '../store';

export * from './undo';
export * from './align';
export * from './select';
export * from './elements';
export * from './group';
export * from './copy';

export const setShowGrid = (show: boolean) => {
  useStore.setState((_state) => ({ showGrid: show }));
};

export const setTheme = (theme: Theme) => {
  useStore.setState((_state) => ({ theme }));
};

export const setCanvasCtx = (ctx: null | CanvasRenderingContext2D) => {
  useStore.setState((_state) => ({ canvasCtx: ctx }));
};

export const setTool = (tool: Tool) => {
  useStore.setState((_state) => ({ tool }));
};

export const setDimensions = (dimensions: IDimensions) => {
  useStore.setState((_state) => ({ dimensions }));
};

export const setDragging = (dragging: boolean) => {
  useStore.setState((state) => ({ dragging }));
};

export const setSpacePressed = (spacePressed: boolean) => {
  useStore.setState((state) => ({ spacePressed }));
};

export const setToolLocked = (toolLocked: boolean) => {
  useStore.setState((state) => ({ toolLocked }));
};

export const setCurrentCell = (currentCell: Point) => {
  useStore.setState((_state) => ({ currentCell }));
};

export const drag = (mouseMove: MouseMove) => {
  const scalesMovedX =
    mouseMove.accX > 0 ? Math.floor(mouseMove.accX / X_SCALE) : Math.ceil(mouseMove.accX / X_SCALE);
  const xBy = scalesMovedX * X_SCALE;

  const scalesMovedY =
    mouseMove.accY > 0 ? Math.floor(mouseMove.accY / Y_SCALE) : Math.ceil(mouseMove.accY / Y_SCALE);
  const yBy = scalesMovedY * Y_SCALE;

  useStore.setState(
    produce<AppState>((state) => {
      // Move Groups
      state.selectedGroupIds.forEach((groupId) => {
        state.groups[groupId].elementIds.forEach((elementId) => {
          state.elements[elementId].x = state.elements[elementId].x + xBy;
          state.elements[elementId].y = state.elements[elementId].y + yBy;
        });
      });

      // Move Elements
      state.selectedIds.forEach((elementId) => {
        state.elements[elementId].x = state.elements[elementId].x + xBy;
        state.elements[elementId].y = state.elements[elementId].y + yBy;
      });
    })
  );
};

export function importToCanvas(objs: any[]) {
  let elements = {};
  try {
    elements = _.reduce(
      objs,
      (acc, obj) => {
        const element = parse(obj);
        element.x = element.x * X_SCALE;
        element.y = element.y * Y_SCALE;
        acc[element.id] = element;
        return acc;
      },
      {} as Elements
    );
  } catch (ElementParseError) {
    console.log('Cannot parse Elements');
  }

  console.log(elements);
  if (elements) {
    useStore.setState((state) => ({
      elements,
      draft: null,
      selectedIds: [],
      groups: {},
      groupForElement: {},
      selectedGroupIds: [],
    }));

    groupIDGenerator.setID(0);
    elementIDGenerator.setID(
      _.max(
        _.map(objs, (obj) => {
          const id: string = obj['id'] as string;
          return parseInt(id.substring(1));
        })
      )
    );
  }
}
