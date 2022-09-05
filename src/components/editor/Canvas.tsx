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
import { useStore } from '../../state';
import { X_SCALE, Y_SCALE } from '../../constants';
import _ from 'lodash';
import { IMouseMove, Theme } from '../../types';
import draw from '../../draw';
import { TextInput } from '../TextInput';
import { styled } from '../../stitches.config';
import { mauve } from '@radix-ui/colors';

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

function CanvasWithInput(): JSX.Element {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [dragging, setDragging] = useState(false);
  const [editingText, setEditingText] = useState<null | Text>(null);

  const elements = useStore((state) => state.elements);
  const setElements = useStore((state) => state.setElements);
  const updateElement = useStore((state) => state.updateElement);
  const deleteElement = useStore((state) => state.deleteElement);

  const editingElement = useStore((state) => state.editingElement);
  const setEditingElement = useStore((state) => state.setEditingElement);

  const selectedIds = useStore((state) => state.selectedIds);
  const select = useStore((state) => state.select);
  const unselect = useStore((state) => state.unselect);
  const resetSelected = useStore((state) => state.resetSelected);

  const ctx = useStore((state) => state.canvasCtx);
  const setCtx = useStore((state) => state.setCanvasCtx);

  const tool = useStore((state) => state.tool);
  const setTool = useStore((state) => state.setTool);
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

      const primaryColor = theme === Theme.dark ? mauve.mauve8 : mauve.mauve12;

      ctx.fillStyle = primaryColor;
      ctx.strokeStyle = primaryColor;
      ctx.textBaseline = 'middle';
      setCtx(ctx);
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
        selectedIds.forEach((selectedId) => {
          const element = _.find(elements, (elem) => elem.id === selectedId);
          element && draw.dashedRect(ctx, utilFor(element).outlineBounds(element));
        });
      }
    }
  }

  // Reset Select
  useEffect(() => {
    if (selectedIds.length > 0 && tool !== Tool.Select) {
      resetSelected([]);
    }
  }, [tool]);

  return (
    <>
      <StyledCanvas
        id="canvas"
        ref={canvasRef}
        aria-label="ascii canvas"
        onMouseDown={(e) => {
          if (editingElement && editingElement.type !== ElementType.Text) {
            setElements([...elements, santizeElement(editingElement)], false);
            select(editingElement.id);
            setTool(Tool.Select);
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
        }}
        onMouseUp={(e) => {
          if (tool !== Tool.Select) {
            // TODO: Add single zustand action
            if (editingElement && editingElement.type !== ElementType.Text) {
              setElements([...elements, santizeElement(editingElement)], false);
              select(editingElement.id);
              setTool(Tool.Select);
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
        }}
        // TODO: Need to clean this up
        onMouseMove={(e) => {
          // Accumulate mouse movement into batches of scale
          // TODO: How to handle this for different screen resolutions?
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
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (selectedIds.length > 0 && e.key === 'Backspace') {
            selectedIds.forEach((selectedId) => {
              deleteElement(selectedId);
            });
            resetSelected([]);
          }

          // TODO: Move to App div level
          if (!editingElement && SHORTCUT_TO_TOOL[e.key]) {
            setTool(SHORTCUT_TO_TOOL[e.key]);
          }
        }}
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
