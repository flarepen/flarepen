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
} from './element';
import { useStore } from './state';
import { X_SCALE, Y_SCALE } from './constants';
import _ from 'lodash';
import { IMouseMove } from './types';
import draw from './draw';

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

  const elements = useStore((state) => state.elements);
  const setElements = useStore((state) => state.setElements);

  const selectedElement = useStore((state) => state.selectedElement);
  const setSelectedElement = useStore((state) => state.setSelectedElement);

  const ctx = useStore((state) => state.canvasCtx);
  const setCtx = useStore((state) => state.setCanvasCtx);

  const setTool = useStore((state) => state.setTool);

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
  }, [elements, editingElement, dimensions, selectedElement]);

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
      if (selectedElement) {
        draw.dashedRect(ctx, utilFor(selectedElement).outlineBounds(selectedElement));
      }
    }
  }

  // Reset Select
  useEffect(() => {
    if (selectedElement && tool !== Tool.Select) {
      setSelectedElement(null);
    }
  }, [tool]);

  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      style={{ display: 'block' }}
      aria-label="ascii canvas"
      onMouseDown={(e) => {
        // Handle Text Element
        if (editingElement) {
          setElements([...elements, santizeElement(editingElement)]);
          setEditingElement(null);
          return null;
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
            setSelectedElement(selected);
            setDragging(true); // GTK: Does these calls get batched in React??
          } else {
            setSelectedElement(null);
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
          if (selectedElement) {
            selectedElement.x = clipToScale(selectedElement.x, X_SCALE);
            selectedElement.y = clipToScale(selectedElement.y, Y_SCALE);
            drawScene();
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
          // TODO: Remove direct mutation and manual draw
          if (dragging && selectedElement) {
            utilFor(selectedElement).drag(selectedElement, mouseMove, (updated) => {
              selectedElement.x = updated.x;
              selectedElement.y = updated.y;
              drawScene();
            });
          }
        }

        mouseMove.flushAcc();
        mouseMove.previousEvent = e;
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (editingElement && editingElement.type === ElementType.Text) {
          const content = editingElement.content + e.key;
          setEditingElement({ ...editingElement, content, shape: g.text(content) });
          return null;
        }

        if (selectedElement && e.key === 'Backspace') {
          const index = _.findIndex(elements, (element) => element.id === selectedElement.id);
          if (index > -1) {
            elements.splice(index, 1);
            setElements(elements);
            setSelectedElement(null);
          }
        }

        if (!editingElement && SHORTCUT_TO_TOOL[e.key]) {
          setTool(SHORTCUT_TO_TOOL[e.key]);
        }
      }}
    >
      <div>Test</div>
    </canvas>
  );
}

export default Canvas;
