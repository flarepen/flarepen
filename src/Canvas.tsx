import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import * as g from './geometry';
import { SHORTCUT_TO_TOOL, Tool } from './tools';
import {
  ElementType,
  Element,
  Point,
  createElement,
  ElementUtilsMap,
  ElementUtils,
  Text,
  TextUtils,
} from './element';
import { useStore } from './state';
import { X_SCALE, Y_SCALE } from './constants';
import _ from 'lodash';
import { IMouseMove } from './types';
import draw from './draw';
import { TextInput } from './components/TextInput';

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

interface CanvasProps {
  tool: Tool;
}

function Canvas({ tool }: CanvasProps): JSX.Element {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [editingElement, setEditingElement] = useState<null | Element>(null);
  const [dragging, setDragging] = useState(false);
  const [editingText, setEditingText] = useState<null | Text>(null);

  const elements = useStore((state) => state.elements);
  const setElements = useStore((state) => state.setElements);
  const updateElement = useStore((state) => state.updateElement);
  const deleteElement = useStore((state) => state.deleteElement);

  const selectedId = useStore((state) => state.selectedId);
  const setSelectedId = useStore((state) => state.setSelectedId);

  const ctx = useStore((state) => state.canvasCtx);
  const setCtx = useStore((state) => state.setCanvasCtx);

  const setTool = useStore((state) => state.setTool);

  const past = useStore((state) => state.past);
  const future = useStore((state) => state.future);
  const redo = useStore((state) => state.redo);
  const undo = useStore((state) => state.undo);

  const canRedo = future.length > 0;
  const canUndo = past.length > 0;

  const scale = window.devicePixelRatio;

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
  }, [dimensions]);

  // Refresh scene
  useEffect(() => {
    drawScene();
  }, [elements, editingElement, dimensions, selectedId]);

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
      if (selectedId) {
        const element = _.find(elements, (elem) => elem.id === selectedId);
        element && draw.dashedRect(ctx, utilFor(element).outlineBounds(element));
      }
    }
  }

  // Reset Select
  useEffect(() => {
    if (selectedId && tool !== Tool.Select) {
      setSelectedId(null);
    }
  }, [tool]);

  return (
    <>
      <canvas
        id="canvas"
        ref={canvasRef}
        style={{ display: 'block' }}
        aria-label="ascii canvas"
        onMouseDown={(e) => {
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
            if (selected) {
              setSelectedId(selected.id);
              setDragging(true); // GTK: Does these calls get batched in React??
            } else {
              setSelectedId(null);
              setDragging(false);
            }
          }
        }}
        onMouseUp={(e) => {
          if (tool !== Tool.Select) {
            if (editingElement && editingElement.type !== ElementType.Text) {
              setElements([...elements, santizeElement(editingElement)]);
              setEditingElement(null);
            }
          } else {
            setDragging(false);
            // TODO: Remove direct mutation and manual draw
            if (selectedId) {
              updateElement(selectedId, (elem: Element) => {
                elem.x = clipToScale(elem.x, X_SCALE);
                elem.y = clipToScale(elem.y, Y_SCALE);
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
            if (dragging && selectedId) {
              const selectedElement = _.find(elements, (elem) => elem.id === selectedId)!;
              utilFor(selectedElement).drag(selectedElement, mouseMove, updateElement);
            }
          }

          mouseMove.flushAcc();
          mouseMove.previousEvent = e;
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (selectedId && e.key === 'Backspace') {
            deleteElement(selectedId);
            setSelectedId(null);
          }

          if (!editingElement && SHORTCUT_TO_TOOL[e.key]) {
            setTool(SHORTCUT_TO_TOOL[e.key]);
          }

          if (e.ctrlKey) {
            if (e.key === 'z' && canUndo) {
              undo();
            }
            if (e.key === 'y' && canRedo) {
              redo();
            }
          }
        }}
      >
        <div>Test</div>
      </canvas>
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

export default Canvas;
