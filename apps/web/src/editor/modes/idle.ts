import React from 'react';
import { useStore, actions } from '../../state';
import { Tool, ElementTypeForTool } from '../../tools';
import { createElement, ElementType, Text as TextElement, handlerFor, inVicinity, isPointInsideBound } from '../../element';
import { X_SCALE, Y_SCALE } from '../../constants';
import { MouseMove, EditHandle } from '../../types';
import { ModeHandler } from './types';
import _ from 'lodash';

function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

function getEditHandleId(handles: EditHandle[], clientX: number, clientY: number): string | null {
  const point = { x: clientX, y: clientY };
  const handle = handles.find(h => isPointInsideBound(point, h.bounds));
  return handle?.handleId || null;
}

export const IdleMode: ModeHandler = {
  onPointerDown: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    const { tool, spacePressed } = useStore.getState();

    // Start panning
    if (spacePressed) {
      useStore.setState({ 
        interactionMode: { type: 'panning' },
        canvasDrag: 'active',
      });
      return;
    }

    // Start text editing
    if (tool === Tool.Text) {
      const textElement = createElement(
        ElementType.Text,
        clipToScale(e.clientX, X_SCALE),
        clipToScale(e.clientY + Y_SCALE / 2, Y_SCALE)
      );
      useStore.setState({
        interactionMode: { type: 'textEditing', text: textElement as TextElement },
      });
      return;
    }

    // Start drawing
    if (ElementTypeForTool[tool]) {
      const newElement = createElement(
        ElementTypeForTool[tool]!,
        clipToScale(e.clientX, X_SCALE),
        clipToScale(e.clientY + Y_SCALE / 2, Y_SCALE)
      );
      useStore.setState({
        interactionMode: { type: 'drawing', element: newElement, stage: 'pending' },
        draft: { element: newElement, stage: 'pending' }, // Keep old state in sync
      });
      return;
    }

    // Handle Select tool
    if (tool === Tool.Select) {
      const { elements, selectedIds, selectedGroupIds } = useStore.getState();
      
      // Check if clicking on edit handle of selected element
      if (selectedIds.length === 1 && selectedGroupIds.length === 0) {
        const selectedElement = elements[selectedIds[0]];
        const handles = handlerFor(selectedElement).allEditHandles(selectedElement);
        const editHandleId = getEditHandleId(handles, e.clientX, e.clientY);
        if (editHandleId) {
          useStore.setState({
            interactionMode: { type: 'editing', elementId: selectedElement.id, handleId: editHandleId },
          });
          actions.setEditingContext({
            id: selectedElement.id,
            handleId: editHandleId,
          });
          return;
        }
      }

      // Check if clicking on an element
      const toSelect = _.values(elements).find((element) =>
        inVicinity({ x: e.clientX, y: e.clientY }, element)
      );

      if (toSelect) {
        // Select element (stay in idle, dragging will be handled on pointer move)
        // Don't snapshot on multi-select to avoid undo issues
        actions.select(toSelect.id, !e.shiftKey, e.shiftKey ? false : true);
        return;
      }

      // Clicking on empty space - start selection box
      actions.unSelectAll();
      useStore.setState({
        interactionMode: {
          type: 'selecting',
          bounds: {
            x: e.clientX,
            y: e.clientY,
            width: 0,
            height: 0,
          },
        },
        selectionBox: {
          status: 'pending',
          bounds: {
            x: e.clientX,
            y: e.clientY,
            width: 0,
            height: 0,
          },
        },
        dragging: false,
      });
      return;
    }
  },

  onPointerMove: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    const { dragging, selectedIds, selectedGroupIds, elements } = useStore.getState();
    
    // If mouse button is down and elements are selected, start dragging
    if (e.buttons > 0 && !dragging && (selectedIds.length > 0 || selectedGroupIds.length > 0)) {
      useStore.setState({ dragging: true });
    }
    
    // Handle dragging if flag is set
    if (dragging && (selectedIds.length > 0 || selectedGroupIds.length > 0)) {
      actions.drag(mouseMove);
    }
    
    // Update hovered element (only when not dragging)
    if (!dragging) {
      const hoveredElement = _.values(elements).find((element) =>
        inVicinity({ x: e.clientX, y: e.clientY }, element)
      );
      useStore.setState({ hoveredElementId: hoveredElement?.id || null });
    }
    
    // Update current cell
    useStore.setState({
      currentCell: {
        x: clipToScale(e.clientX, X_SCALE),
        y: clipToScale(e.clientY - Y_SCALE / 2, Y_SCALE) + Y_SCALE / 2,
      },
    });
  },

  onPointerUp: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    const { dragging } = useStore.getState();
    
    // Clear dragging flag
    if (dragging) {
      useStore.setState({
        dragging: false,
      });
    }
  },
};
