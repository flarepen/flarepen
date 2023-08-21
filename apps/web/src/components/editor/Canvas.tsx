import { useEffect, useState } from 'react';
import * as g from '../../geometry';
import { SHORTCUT_TO_TOOL, Tool, getCursorForTool } from '../../tools';
import {
  ElementType,
  Element,
  Point,
  createElement,
  ElementUtilsMap,
  ElementUtils,
  Text,
  TextUtils,
} from '../../element';
import { actions, useStore } from '../../state';
import { IS_PLATFORM_MAC, X_SCALE, Y_SCALE } from '../../constants';
import _ from 'lodash';
import { ArrowKey, MouseMove } from '../../types';
import { TextInput } from './TextInput';
import { styled } from '../../stitches.config';
import { useSelectionBox, useHtmlCanvas, useDraw } from './hooks';
import { Property } from '@stitches/react/types/css';
import { cursorEnabled, getCursor } from '../../cursor';

const ElementTypeForTool: { [t in Tool]?: ElementType } = {
  [Tool.Rectangle]: ElementType.Rectangle,
  [Tool.Line]: ElementType.Line,
  [Tool.Arrow]: ElementType.Arrow,
  [Tool.Text]: ElementType.Text,
};

function utilFor(element: Element): ElementUtils<any> {
  return ElementUtilsMap[element.type]!;
}

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

function inVicinity(p: Point, element: Element): boolean {
  return utilFor(element).inVicinity(element, p);
}

let mouseMove = new MouseMove();

const StyledCanvas = styled('canvas', {
  display: 'block',
  background: '$canvasBg',
  zIndex: -2,
});

type CanvasStatus = 'drafting' | 'editing' | 'dragging' | 'selecting';

// TODO: Clean this up. Improve names, add better abstractions.
function CanvasWithInput(): JSX.Element {
  const [editingText, setEditingText] = useState<null | Text>(null);
  const [cursor, setCursor] = useState<Property.Cursor>('default');

  const [selectionBox, selectionBoxHandlers] = useSelectionBox();
  const canvasRef = useHtmlCanvas();

  const elements = useStore((state) => state.elements);
  const elementIds = _.keys(elements);

  const updateElement = actions.updateElement;
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

  const canvasDrag = useStore((state) => state.canvasDrag);
  const spacePressed = useStore((state) => state.spacePressed);
  const toolTocked = useStore((state) => state.toolLocked);

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
    if (spacePressed) {
      actions.setCanvasDrag('active');
      return null;
    }

    if (draft && draft.element.type !== ElementType.Text) {
      actions.addElement(santizeElement(draft.element), false);
      select(draft.element.id, true);
      resetTool();
      setDraft(null);
      return null;
    }

    // Handle Text Element
    if (editingText) {
      editingText.content && actions.addElement(santizeElement(editingText));
      setEditingText(null);
      resetTool();
      return null;
    }

    if (tool === Tool.Text) {
      setEditingText(
        TextUtils.new(
          clipToScale(e.clientX, X_SCALE),
          clipToScale(e.clientY + Y_SCALE / 2, Y_SCALE)
        )
      );
      return null;
    }

    if (ElementTypeForTool[tool]) {
      const newElement = createElement(
        ElementTypeForTool[tool]!,
        clipToScale(e.clientX, X_SCALE),
        clipToScale(e.clientY + Y_SCALE / 2, Y_SCALE)
      );

      setDraft({ element: newElement, stage: 'inactive' });
      return null;
    }

    if (tool === Tool.Select) {
      // Move to Edit mode
      if (selectedIds.length === 1 && selectedGroupIds.length === 0) {
        const selectedElement = elements[selectedIds[0]];
        const editHandleType = utilFor(selectedElement).getEditHandleType(selectedElement, e);
        if (editHandleType) {
          actions.setEditingContext({
            id: selectedElement.id,
            handleType: editHandleType,
          });
          return null;
        }
      }

      // Select Elements and move to drag mode
      const toSelect = _.values(elements).find((element) =>
        inVicinity({ x: e.clientX, y: e.clientY }, element)
      );

      if (toSelect) {
        select(toSelect.id, !e.shiftKey);
        setDragging(true);
        return null;
      }

      // Remove selection
      actions.unSelectAll();
      setDragging(false);

      // Move to Drag and Select Mode
      selectionBoxHandlers.init(e);
    }
  };

  const handlePointerUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (canvasDrag !== 'inactive') {
      actions.sanitizeElements();
      actions.setCanvasDrag('inactive');
    }

    if (tool !== Tool.Select) {
      // TODO: Add single zustand action
      if (draft && draft.element.type !== ElementType.Text) {
        if (draft.stage === 'active') {
          actions.addElement(santizeElement(draft.element), false);
          select(draft.element.id, true);
        }
        resetTool();
        setDraft(null);
      }
    } else {
      editingContext.id && actions.setEditingContext({ id: null, handleType: null });
      setDragging(false);
      selectionBoxHandlers.inactive();
      // TODO: Remove direct mutation and manual draw
      if (selectedIds.length + selectedGroupIds.length > 0) {
        actions.sanitizeElements();
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    // Accumulate mouse movement into batches of scale
    mouseMove.currentEvent = e;
    mouseMove.acc();

    actions.setCurrentCell({
      x: clipToScale(e.clientX, X_SCALE),
      y: clipToScale(e.clientY - Y_SCALE / 2, Y_SCALE) + Y_SCALE / 2,
    });

    if (canvasDrag === 'active') {
      const x_by =
        mouseMove.currentEvent!.clientX -
        (mouseMove.previousEvent ? mouseMove.previousEvent.clientX : 0);
      const y_by =
        mouseMove.currentEvent!.clientY -
        (mouseMove.previousEvent ? mouseMove.previousEvent.clientY : 0);
      actions.shiftElements(x_by, y_by);
    } else if (draft) {
      utilFor(draft.element).create(draft.element, mouseMove, (updated) => {
        setDraft({ element: updated, stage: 'active' });
      });
    } else {
      if (dragging && (selectedIds.length > 0 || selectedGroupIds.length > 0)) {
        actions.drag(mouseMove);
      }

      if (selectionBox.status === 'pending' || selectionBox.status === 'active') {
        selectionBoxHandlers.expand(mouseMove);
      }

      if (editingContext.id && editingContext.handleType) {
        const selectedElement = elements[editingContext.id];
        actions.updateElement(
          editingContext.id,
          utilFor(selectedElement).edit(selectedElement, mouseMove, editingContext.handleType)
        );
      }
    }

    // Show edit mouse pointers
    if (!dragging && selectedIds.length > 0 && selectedGroupIds.length === 0) {
      const selectedElement = elements[selectedIds[0]];
      const editHandles = utilFor(selectedElement).allEditHandles(selectedElement);
      const activeHandle = _.find(editHandles, (handle) => {
        return cursorEnabled({ x: e.clientX, y: e.clientY }, handle.bounds);
      });

      if (activeHandle) {
        setCursor(getCursor(activeHandle.handleType));
      } else {
        if (!editingContext.id) {
          setCursor('default');
        }
      }
    }

    mouseMove.flushAcc();
    mouseMove.previousEvent = e;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    // Manually track space press
    if (e.key === ' ') {
      actions.setSpacePressed(true);
    }

    const ctrlKey = IS_PLATFORM_MAC ? e.metaKey : e.ctrlKey;

    // Handle Keyboard events when any element or group is selected
    if (selectedIds.length + selectedGroupIds.length > 0) {
      switch (e.key) {
        case 'Backspace':
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
    if (e.detail == 2 && selectedIds.length == 1) {
      const selectedElement = elements[selectedIds[0]];

      if (selectedElement.type === ElementType.Text) {
        actions.unSelectAll();
        deleteElement(selectedElement.id);
        setEditingText(selectedElement);
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
      >
        <div>Test</div>
      </StyledCanvas>
      {editingText && (
        <TextInput
          x={editingText.x}
          y={editingText.y - Y_SCALE / 2}
          value={editingText.content}
          onInput={(e) => {
            setEditingText({
              ...editingText,
              shape: g.text(e.target.value || ''),
              content: e.target.value || '',
            });
          }}
        />
      )}
    </>
  );
}

export default CanvasWithInput;
