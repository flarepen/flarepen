import React from 'react';
import { useStore, actions } from '../../../state';
import { X_SCALE, Y_SCALE } from '../../../constants';
import { MouseMove } from '../../../types';
import { ModeHandler } from './types';
import { expandIBound, insideBound } from '../../../element';
import _ from 'lodash';

function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

export const SelectingMode: ModeHandler = {
  onPointerDown: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    // Already selecting, shouldn't happen
  },

  onPointerMove: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    const { interactionMode, elements } = useStore.getState();
    if (interactionMode.type !== 'selecting') return;

    // Expand selection box
    const expandedBounds = expandIBound(interactionMode.bounds, mouseMove);
    
    // Find elements inside selection box
    const toSelect = _.map(
      _.filter(_.values(elements), (element) => insideBound(element, expandedBounds)),
      (element) => element.id
    );

    // Update selection box and selected elements
    useStore.setState({
      interactionMode: { type: 'selecting', bounds: expandedBounds },
      selectionBox: { status: 'active', bounds: expandedBounds },
    });
    
    actions.setSelected(toSelect);

    // Update current cell
    useStore.setState({
      currentCell: {
        x: clipToScale(e.clientX, X_SCALE),
        y: clipToScale(e.clientY - Y_SCALE / 2, Y_SCALE) + Y_SCALE / 2,
      },
    });
  },

  onPointerUp: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    // End selecting
    useStore.setState({
      interactionMode: { type: 'idle' },
      selectionBox: { status: 'inactive', bounds: null },
    });
  },
};
