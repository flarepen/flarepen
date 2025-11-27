import React from 'react';
import { useStore, actions } from '@/state';
import { Tool, ElementTypeForTool } from '@/tools';
import { createElement, ElementType, Text as TextElement, handlerFor, inVicinity, isPointInsideBound } from '@/element';
import { X_SCALE, Y_SCALE } from '@/constants';
import { MouseMove, EditHandle } from '@/types';
import { ModeHandler } from '@/editor/modes/types';
import { getCursor, cursorEnabled } from '@/cursor';
import _ from 'lodash';

function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

function getEditHandleId(handles: EditHandle[], clientX: number, clientY: number): string | null {
  const point = { x: clientX, y: clientY };
  const handle = handles.find(h => isPointInsideBound(point, h.bounds));
  return handle?.handleId || null;
}

/**
 * Idle Mode - Default state that handles mode transitions
 *
 * **Transitions:**
 * ```txt
 * space + click                     → panning
 * text tool                         → textEditing
 * drawing tool                      → drawing
 * select tool + click element       → stays in idle (dragging)
 * select tool + click edit handle   → editing
 * select tool + click empty         → selecting
 * ```
 */
export const IdleMode: ModeHandler = {
  onPointerDown: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    const { tool, spacePressed } = useStore.getState();

    // Start panning
    if (spacePressed) {
      useStore.setState({
        interactionMode: { type: 'panning' }
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
      const clickedElements = _.values(elements).filter((element) =>
        inVicinity({ x: e.clientX, y: e.clientY }, element)
      );

      if (clickedElements.length > 0) {
        let toSelect = clickedElements[0];

        // If there are multiple elements and exactly one is selected, cycle through them
        if (clickedElements.length > 1 && selectedIds.length === 1) {
          const currentIndex = clickedElements.findIndex(el => el.id === selectedIds[0]);
          if (currentIndex !== -1) {
            // Currently selected element is in the clicked elements, select next one
            const nextIndex = (currentIndex + 1) % clickedElements.length;
            toSelect = clickedElements[nextIndex];
          }
        }

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
    
    // Update hovered element and cursor (only when not dragging)
    if (!dragging) {
      const { selectedIds, selectedGroupIds, editingContext } = useStore.getState();

      let newCursor = 'default';

      // Check for edit handle hover on selected element (highest priority)
      if (selectedIds.length === 1 && selectedGroupIds.length === 0) {
        const selectedElement = elements[selectedIds[0]];
        const editHandles = handlerFor(selectedElement).allEditHandles(selectedElement);
        const activeHandle = _.find(editHandles, (handle) => {
          return cursorEnabled({ x: e.clientX, y: e.clientY }, handle.bounds);
        });

        if (activeHandle) {
          newCursor = getCursor(activeHandle.handleId);
        }
      }

      // If no edit handle, check for element hover
      if (newCursor === 'default') {
        const hoveredElement = _.values(elements).find((element) =>
          inVicinity({ x: e.clientX, y: e.clientY }, element)
        );

        const newHoveredId = hoveredElement?.id || null;
        const { hoveredElementId: currentHoveredId } = useStore.getState();

        if (hoveredElement) {
          newCursor = 'move';
        }

        // Update hovered element ID if changed
        if (newHoveredId !== currentHoveredId) {
          useStore.setState({ hoveredElementId: newHoveredId });
        }
      }

      // Update cursor if changed
      const currentCursor = useStore.getState().cursor;
      if (newCursor !== currentCursor) {
        useStore.setState({ cursor: newCursor });
      }
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
