import { useEffect } from 'react';
import * as g from '../geometry';
import { SHORTCUT_TO_TOOL, Tool, getCursorForTool } from '../tools';
import {
  ElementType,
  Element,
} from '../element';
import { actions, useStore } from '../state';
import { IS_PLATFORM_MAC, X_SCALE, Y_SCALE } from '../constants';
import _ from 'lodash';
import { ArrowKey, MouseMove } from '../types';
import { TextInput } from './TextInput';
import { styled } from '../stitches.config';
import { useSelectionBox, useHtmlCanvas, useDraw } from './hooks';
import { getModeHandler } from './modes';
import { getCanvasCoordinates } from './utils/coordinates';

// We cant allow any x and y since everything is ASCII.
// Instead x and y should be multiples of respective scale values.
function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

// Resets any negative width or height
function santizeElement(element: Element) {
  if (element.type === ElementType.Rectangle) {
    return {
      ...element,
      x: clipToScale(element.x, X_SCALE),
      y: clipToScale(element.y, Y_SCALE),
      width: Math.abs(element.width),
      height: Math.abs(element.height),
    };
  } else {
    return {
      ...element,
      x: clipToScale(element.x, X_SCALE),
      y: clipToScale(element.y, Y_SCALE),
    };
  }
}

let mouseMove = new MouseMove();

const StyledCanvas = styled('canvas', {
  display: 'block',
  background: '$canvasBg',
  zIndex: -2,
  outline: 'none', // Remove blue focus outline
  '&:focus': {
    outline: 'none',
  },
});

// TODO: Clean this up. Improve names, add better abstractions.
function CanvasWithInput(): JSX.Element {
  const [selectionBox, selectionBoxHandlers] = useSelectionBox();
  const canvasRef = useHtmlCanvas();

  const elements = useStore((state) => state.elements);
  const cursor = useStore((state) => state.cursor);

  const deleteElement = actions.deleteElement;

  // Draft is the current element that is being created.
  const draft = useStore((state) => state.draft);
  const setDraft = actions.setDraft;

  const selectedIds = useStore((state) => state.selectedIds);
  const selectedGroupIds = useStore((state) => state.selectedGroupIds);
  const select = actions.select;

  const dragging = useStore((state) => state.dragging);
  const setDragging = actions.setDragging;

  const tool = useStore((state) => state.tool);

  const editingContext = useStore((state) => state.editingContext);

  const spacePressed = useStore((state) => state.spacePressed);
  const toolTocked = useStore((state) => state.toolLocked);

  // New mode-based handlers
  const interactionMode = useStore((state) => state.interactionMode);
  const modeHandler = getModeHandler(interactionMode);

  useDraw();

  // Reset Select
  useEffect(() => {
    if (selectedIds.length + selectedGroupIds.length > 0 && tool !== Tool.Select) {
      actions.unSelectAll();
    }
  }, [tool]);

  const resetTool = () => {
    if (!toolTocked) {
      actions.setTool(Tool.Select);
    }
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    // Event gets triggered on contextmenu click also
    if (e.button === 2 && e.buttons === 2) {
      e.preventDefault();
      return;
    }

    // Convert viewport coordinates to canvas-relative coordinates
    const canvasCoords = getCanvasCoordinates(e, e.currentTarget);
    const adjustedEvent = {
      ...e,
      clientX: canvasCoords.x,
      clientY: canvasCoords.y,
    } as React.MouseEvent<HTMLCanvasElement, MouseEvent>;

    modeHandler.onPointerDown(adjustedEvent, mouseMove);
  };

  const handlePointerUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    // Convert viewport coordinates to canvas-relative coordinates
    const canvasCoords = getCanvasCoordinates(e, e.currentTarget);
    const adjustedEvent = {
      ...e,
      clientX: canvasCoords.x,
      clientY: canvasCoords.y,
    } as React.MouseEvent<HTMLCanvasElement, MouseEvent>;

    modeHandler.onPointerUp(adjustedEvent, mouseMove);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    // Convert viewport coordinates to canvas-relative coordinates
    const canvasCoords = getCanvasCoordinates(e, e.currentTarget);
    const adjustedEvent = {
      ...e,
      clientX: canvasCoords.x,
      clientY: canvasCoords.y,
    } as React.MouseEvent<HTMLCanvasElement, MouseEvent>;

    // Accumulate mouse movement into batches of scale
    mouseMove.currentEvent = adjustedEvent;
    mouseMove.acc();

    modeHandler.onPointerMove(adjustedEvent, mouseMove);

    mouseMove.flushAcc();
    mouseMove.previousEvent = adjustedEvent;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    // ESC to finalize multi-segment line/arrow or cancel draft
    if (e.key === 'Escape') {
      if (interactionMode.type === 'drawing' && 
          (interactionMode.element.type === ElementType.Line || 
           interactionMode.element.type === ElementType.Arrow)) {
        // Finalize if at least 2 points
        if (interactionMode.element.points && interactionMode.element.points.length >= 2) {
          console.log('[Canvas ESC] Points:', interactionMode.element.points);
          
          // Regenerate shape from points
          const finalPoints = interactionMode.element.points;
          const minX = Math.min(...finalPoints.map(p => p.x));
          const minY = Math.min(...finalPoints.map(p => p.y));
          
          const finalElement = {
            ...interactionMode.element,
            x: minX,
            y: minY,
            points: finalPoints,
            shape: g.polyline(finalPoints),
          };
          
          console.log('[Canvas ESC] Final element:', finalElement);
          actions.addElement(santizeElement(finalElement), false);
          actions.select(finalElement.id, true);
          
          if (!toolTocked) {
            actions.setTool(Tool.Select);
          }
        }
        
        useStore.setState({
          interactionMode: { type: 'idle' },
          draft: null,
        });
        return;
      }
      
      // Cancel pending draft (other elements)
      if (draft && draft.stage === 'pending') {
        setDraft(null);
        return;
      }
    }

    // Manually track space press
    if (e.key === ' ') {
      actions.setSpacePressed(true);
    }

    const ctrlKey = IS_PLATFORM_MAC ? e.metaKey : e.ctrlKey;

    // Handle Keyboard events when any element or group is selected
    if (selectedIds.length + selectedGroupIds.length > 0) {
      switch (e.key) {
        case 'Backspace':
        case 'Delete':
          actions.deleteAllSelected();
          actions.unSelectAll();
          break;
        case ArrowKey.Left:
          actions.updateAllSelected((element) => {
            element.x = element.x - X_SCALE;
          });
          break;
        case ArrowKey.Right:
          actions.updateAllSelected((element) => {
            element.x = element.x + X_SCALE;
          });
          break;
        case ArrowKey.Up:
          actions.updateAllSelected((element) => {
            element.y = element.y - Y_SCALE;
          });
          break;
        case ArrowKey.Down:
          actions.updateAllSelected((element) => {
            element.y = element.y + Y_SCALE;
          });
          break;
      }
    }

    if (ctrlKey) {
      switch (e.key) {
        case 'a':
          actions.selectAll();
          break;
        case 'v':
          actions.paste();
          break;
        case 'c':
          if (selectedIds.length + selectedGroupIds.length > 0) {
            actions.copy(selectedIds, selectedGroupIds);
          }
          break;
      }
      return null;
    }

    // TODO: Move to App div level
    // Check on draft to make sure that we handle keyboard shortcuts only when not in draft mode.
    if (!draft && SHORTCUT_TO_TOOL[e.key]) {
      actions.setTool(SHORTCUT_TO_TOOL[e.key]);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    // Manually track space up/down
    if (e.key === ' ') {
      actions.setSpacePressed(false);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Double-click to finalize multi-segment line/arrow
    if (e.detail === 2 && interactionMode.type === 'drawing') {
      console.log('[Canvas] Double-click, interactionMode:', interactionMode.type, interactionMode.element?.type);
      if (interactionMode.element.type === ElementType.Line || 
          interactionMode.element.type === ElementType.Arrow) {
        console.log('[Canvas] Points count:', interactionMode.element.points?.length);
        // Finalize if at least 2 points
        if (interactionMode.element.points && interactionMode.element.points.length >= 2) {
          console.log('[Canvas] Finalizing line/arrow');
          
          // Regenerate shape from points
          const finalPoints = interactionMode.element.points;
          console.log('[Canvas] Final points:', finalPoints);
          const minX = Math.min(...finalPoints.map(p => p.x));
          const minY = Math.min(...finalPoints.map(p => p.y));
          console.log('[Canvas] Calculated minX/minY:', minX, minY);
          
          const finalElement = {
            ...interactionMode.element,
            x: minX,
            y: minY,
            points: finalPoints,
            shape: g.polyline(finalPoints),
          };
          
          console.log('[Canvas] Final element:', finalElement);
          actions.addElement(santizeElement(finalElement), false);
          actions.select(finalElement.id, true);
          
          if (!toolTocked) {
            actions.setTool(Tool.Select);
          }
          
          useStore.setState({
            interactionMode: { type: 'idle' },
            draft: null,
          });
        }
      }
      return;
    }

    // Double-click on text to edit
    if (e.detail == 2 && selectedIds.length == 1) {
      const selectedElement = elements[selectedIds[0]];

      if (selectedElement.type === ElementType.Text) {
        actions.unSelectAll();
        deleteElement(selectedElement.id);
        useStore.setState({
          interactionMode: { type: 'textEditing', text: selectedElement },
        });
      }
    }
  };

  // TODO: Cleanup
  const finalCursor = () => {
    if (spacePressed) {
      return 'grab';
    }

    if (cursor === 'default') {
      return getCursorForTool(tool);
    }

    return cursor;
  };

  return (
    <>
      <StyledCanvas
        id="canvas"
        ref={canvasRef}
        aria-label="ascii canvas"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        css={{ cursor: finalCursor() }}
        onContextMenu={(e) => {
          // Show custom Context Menu
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div>Test</div>
      </StyledCanvas>
      {interactionMode.type === 'textEditing' && (
        <TextInput
          x={interactionMode.text.x}
          y={interactionMode.text.y - Y_SCALE / 2}
          value={interactionMode.text.content}
          onInput={(e) => {
            useStore.setState({
              interactionMode: {
                type: 'textEditing',
                text: {
                  ...interactionMode.text,
                  shape: g.text(e.target.value || ''),
                  content: e.target.value || '',
                },
              },
            });
          }}
        />
      )}
    </>
  );
}

export default CanvasWithInput;
