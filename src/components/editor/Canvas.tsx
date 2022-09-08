import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import * as g from '../../geometry';
import { SHORTCUT_TO_TOOL, Tool } from '../../tools';
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
import { X_SCALE, Y_SCALE } from '../../constants';
import _ from 'lodash';
import { IMouseMove, Theme } from '../../types';
import draw from '../../draw';
import { TextInput } from './TextInput';
import { styled } from '../../stitches.config';
import { mauve, orange } from '@radix-ui/colors';

const ElementTypeForTool: { [t in Tool]?: ElementType } = {
  [Tool.Rectangle]: ElementType.Rectangle,
  [Tool.Line]: ElementType.Line,
  [Tool.Arrow]: ElementType.Arrow,
  [Tool.Text]: ElementType.Text,
};

function consoleShape(shape: g.Shape) {
  console.log(shape.join('\n'));
}

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

let mouseMove = new IMouseMove();

const StyledCanvas = styled('canvas', {
  display: 'block',
  background: '$canvasBackground',
  zIndex: -2,
});

function canvasColors(theme: Theme) {
  if (theme === Theme.light) {
    return {
      text: mauve.mauve12,
      selection: orange.orange10,
      selectionBackground: orange.orange10,
    };
  } else {
    return {
      text: mauve.mauve8,
      selection: orange.orange11,
      selectionBackground: orange.orange11,
    };
  }
}

function CanvasWithInput(): JSX.Element {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [dragging, setDragging] = useState(false);
  const [editingText, setEditingText] = useState<null | Text>(null);

  const elements = useStore((state) => state.elements);
  const setElements = actions.setElements;
  const updateElement = actions.updateElement;
  const deleteElement = actions.deleteElement;

  const editingElement = useStore((state) => state.editingElement);
  const setEditingElement = actions.setEditingElement;

  const selectedIds = useStore((state) => state.selectedIds);
  const select = actions.select;
  const unselect = actions.unselect;
  const resetSelected = actions.resetSelected;

  const ctx = useStore((state) => state.canvasCtx);

  const tool = useStore((state) => state.tool);
  const scale = window.devicePixelRatio;

  const theme = useStore((state) => state.theme);

  // Handle Resize
  useEffect(() => {
    function handleWindowResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    const debouncedHandler = debounce(handleWindowResize, 100);

    window.addEventListener('resize', debouncedHandler);

    return () => window.removeEventListener('resize', debouncedHandler);
  });

  const canvasRef = useRef(null);

  function setupCanvas() {
    if (canvasRef.current) {
      const canvas: HTMLCanvasElement = canvasRef.current;
      canvas.width = dimensions.width * scale;
      canvas.height = dimensions.height * scale;

      canvas.style.width = canvas.width / window.devicePixelRatio + 'px';
      canvas.style.height = canvas.height / window.devicePixelRatio + 'px';

      const ctx = canvas.getContext('2d')!;
      ctx.font = '22px Cascadia';
      ctx.scale(scale, scale);

      const primaryColor = canvasColors(theme).text;

      ctx.fillStyle = primaryColor;
      ctx.strokeStyle = primaryColor;
      ctx.textBaseline = 'middle';
      actions.setCanvasCtx(ctx);
    }
  }

  // Setup Canvas on initial load
  useEffect(() => {
    setupCanvas();
  }, []);

  // Fix Canvas on resize
  useEffect(() => {
    setupCanvas();
  }, [dimensions, theme]);

  // Refresh scene
  useEffect(() => {
    drawScene();
  }, [elements, editingElement, dimensions, selectedIds, theme]);

  function drawScene() {
    if (ctx) {
      // Clear scene
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // First draw all elements created till now
      elements.forEach((element) => {
        draw.element(ctx, element);
      });

      // draw current editing element
      editingElement && draw.element(ctx, editingElement);

      // draw selection indicator
      if (selectedIds.length > 0) {
        const selectedElements = _.filter(elements, (element) =>
          _.includes(selectedIds, element.id)
        );

        const colors = canvasColors(theme);

        if (selectedElements.length === 1) {
          draw.rect(
            ctx,
            utilFor(selectedElements[0]).outlineBounds(selectedElements[0]),
            colors.selection,
            colors.selectionBackground
          );
        } else {
          const allBounds = _.map(selectedElements, (element) =>
            utilFor(element).outlineBounds(element)
          );

          allBounds.forEach((bound) => {
            draw.rect(ctx, bound, colors.selection, colors.selectionBackground);
          });

          const bounds = g.getBoundingRectForBounds(allBounds);

          draw.dashedRect(
            ctx,
            {
              x: bounds.x - X_SCALE / 2,
              y: bounds.y - Y_SCALE / 2,
              width: bounds.width + X_SCALE,
              height: bounds.height + Y_SCALE,
            },
            colors.selection,
            colors.selectionBackground,
            [4, 2]
          );
        }
      }

      // // Resize Experiment
      // if (selectedIds.length === 1) {
      //   const element = _.find(elements, (elem) => elem.id === selectedIds[0])!;
      //   if (element.type === ElementType.Rectangle) {
      //     const { x, y, width, height } = utilFor(element).outlineBounds(element);
      //     const size = 8;
      //     [
      //       [x - size, y - size],
      //       [x - size, y + height],
      //       [x + width, y - size],
      //       [x + width, y + height],
      //       [x + width / 2 - 5, y - size],
      //       [x + width / 2 - 5, y + height],
      //       [x - size, y + height / 2 - size / 2],
      //       [x + width, y + height / 2 - size / 2],
      //     ].forEach((xy) => draw.rect(ctx, { x: xy[0], y: xy[1], width: size, height: size }));
      //   }
      // }
    }
  }

  // Reset Select
  useEffect(() => {
    if (selectedIds.length > 0 && tool !== Tool.Select) {
      resetSelected([]);
    }
  }, [tool]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (editingElement && editingElement.type !== ElementType.Text) {
      setElements([...elements, santizeElement(editingElement)], false);
      select(editingElement.id);
      actions.setTool(Tool.Select);
      setEditingElement(null);
      return null;
    }

    // Handle Text Element
    if (tool === Tool.Text) {
      if (editingText) {
        setElements([...elements, santizeElement(editingText)]);
        setEditingText(null);
        return null;
      } else {
        setEditingText(
          TextUtils.new(clipToScale(e.clientX, X_SCALE), clipToScale(e.clientY, Y_SCALE))
        );
        return null;
      }
    }

    if (ElementTypeForTool[tool]) {
      const newElement = createElement(
        ElementTypeForTool[tool]!,
        clipToScale(e.clientX, X_SCALE),
        clipToScale(e.clientY, Y_SCALE)
      );

      setEditingElement(newElement);
    } else if (tool === Tool.Select) {
      const selected = elements.find((element) =>
        inVicinity({ x: e.clientX, y: e.clientY }, element)
      );

      if (selected && _.includes(selectedIds, selected.id)) {
        setDragging(true);
        return null;
      }

      if (selected) {
        if (e.shiftKey) {
          select(selected.id);
        } else {
          resetSelected([selected.id]);
        }
        setDragging(true); // GTK: Does these calls get batched in React??
      } else {
        resetSelected([]);
        setDragging(false);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (tool !== Tool.Select) {
      // TODO: Add single zustand action
      if (editingElement && editingElement.type !== ElementType.Text) {
        setElements([...elements, santizeElement(editingElement)], false);
        select(editingElement.id);
        actions.setTool(Tool.Select);
        setEditingElement(null);
      }
    } else {
      setDragging(false);
      // TODO: Remove direct mutation and manual draw
      if (selectedIds.length > 0) {
        selectedIds.forEach((selectedId) => {
          updateElement(selectedId, (elem: Element) => {
            elem.x = clipToScale(elem.x, X_SCALE);
            elem.y = clipToScale(elem.y, Y_SCALE);
          });
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    // Accumulate mouse movement into batches of scale
    mouseMove.currentEvent = e;
    mouseMove.acc();

    if (editingElement) {
      utilFor(editingElement).moveToEdit(editingElement, mouseMove, (updated) => {
        setEditingElement(updated);
      });
    } else {
      if (dragging && selectedIds.length > 0) {
        selectedIds.forEach((selectedId) => {
          const selectedElement = _.find(elements, (elem) => elem.id === selectedId)!;
          utilFor(selectedElement).drag(selectedElement, mouseMove, updateElement);
        });
      }
    }

    mouseMove.flushAcc();
    mouseMove.previousEvent = e;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (selectedIds.length > 0 && e.key === 'Backspace') {
      selectedIds.forEach((selectedId) => {
        deleteElement(selectedId);
      });
      resetSelected([]);
    }

    // TODO: Move to App div level
    if (!editingElement && SHORTCUT_TO_TOOL[e.key]) {
      actions.setTool(SHORTCUT_TO_TOOL[e.key]);
    }
  };

  return (
    <>
      <StyledCanvas
        id="canvas"
        ref={canvasRef}
        aria-label="ascii canvas"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div>Test</div>
      </StyledCanvas>
      {editingText && (
        <TextInput
          x={editingText.x}
          y={editingText.y}
          onInput={(e) => {
            setEditingText({
              ...editingText,
              shape: g.text(e.currentTarget.textContent || ''),
              content: e.currentTarget.textContent || '',
            });
          }}
        />
      )}
    </>
  );
}

export default CanvasWithInput;
