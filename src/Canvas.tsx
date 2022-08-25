import { useEffect, useRef, useState } from "react";
import { debounce  } from "lodash";
import * as g from "./geometry" ;
import { Tool } from "./App";
import { ElementType, Rectangle, LineDirection, Line, ArrowDirection, Arrow, Element } from "./element";

function newRectangle(x: number, y: number, width: number, height: number): Rectangle {
    return { x, y, width, height, shape: g.rectangle(width, height), type: ElementType.Rectangle };
}

function newLine(x: number, y: number, len: number): Line {
    // We can figure out line direction only after it starts moving
    return { x, y, len, direction: LineDirection.Undecided, shape: [""], type: ElementType.Line };
}

function newArrow(x: number, y: number, len: number): Arrow {
    return { x, y, len, direction: ArrowDirection.Undecided, shape: [""], type: ElementType.Arrow }
}

function drawElement(ctx: CanvasRenderingContext2D, element: Element) {
    let x = element.x;
    let y = element.y;
    element.shape.forEach(row => {
        ctx.fillText(row, x, y);
        y = y + 20;
    })
}

function consoleShape(shape: g.Shape) {
    console.log(shape.join("\n"));
}

let mouseAccX = 0;
let mouseAccY = 0;
let mousePreviousX = 0;
let mousePreviousY = 0;

// Scales are just an approximation for now.
// TODO: Need to move to better pixel measurement for the font.
let X_SCALE = 14;
let Y_SCALE = 20;

// We cant allow any x and y since everything is ASCII.
// Instead x and y should be multiples of respective scale values.
function clipToScale(value: number, scale: number) {
    return Math.floor(value/scale) * scale;
}

// Resets any negative width or height
function santizeElement(element: Element) {
    if (element.type === ElementType.Rectangle) {
        return {
            ...element,
            width: Math.abs(element.width),
            height: Math.abs(element.height)
        }
    } else {
        return element;
    }
}

// TODO: Use it instead of x,y in other places
interface Point {
    x: number,
    y: number,
}

function point(x: number, y: number): Point {
    return {x, y};
}

function getLinearBounding(origin: Point, len: number, horizontal: boolean): { xMin: number, xMax: number, yMin: number, yMax: number } {
    const xMin = origin.x - X_SCALE;
    const xMax = horizontal ? (origin.x + X_SCALE + len * X_SCALE) : (origin.x + X_SCALE);
    const yMin = origin.y - Y_SCALE;
    const yMax = horizontal ? (origin.y + Y_SCALE) : (origin.y + Y_SCALE + len * Y_SCALE);

    return { xMin, xMax, yMin, yMax };
}

function inLinearVicinity(p: Point, origin: Point, len: number, horizontal: boolean): boolean {
    const { xMin, xMax, yMin, yMax } = getLinearBounding(origin, len, horizontal);

    return (p.x >= xMin && p.x <= xMax) && (p.y >= yMin && p.y <= yMax);
}

function inVicinity(p: Point, element: Element): boolean {
    switch (element.type) {
        case ElementType.Rectangle:
            const {x, y, width, height} = element;
            return (
                inLinearVicinity(p, point(x, y), width, true) ||
                inLinearVicinity(p, point(x, y), height, false) ||
                inLinearVicinity(p, point(x, y + height * Y_SCALE), width, true) ||
                inLinearVicinity(p, point(x + width * X_SCALE, y), height, false)
            );
        case ElementType.Line:
            return inLinearVicinity(p, {x: element.x, y: element.y}, element.len, element.direction === LineDirection.Horizontal)
        case ElementType.Arrow:
            return inLinearVicinity(p, {x: element.x, y: element.y}, element.len,
                element.direction === ArrowDirection.Left || element.direction === ArrowDirection.Right );
    }
}

interface CanvasProps {
    tool: Tool
}

function Canvas({tool}: CanvasProps): JSX.Element {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [ctx, setCtx] = useState<null|CanvasRenderingContext2D>(null);
    const [elements, setElements] = useState<Element[]>([]);
    const [editingElement, setEditingElement] = useState<null|Element>(null);
    const [selectedElement, setSelectedElement] = useState<null|Element>(null);
    const [dragging, setDragging] = useState(false);

    const scale = window.devicePixelRatio;

    const styles = { display: "block", width: "100vw", height: "100vh" }

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

    // Get Context. TODO: Possibly a new hook?
    useEffect(() => {
        if (canvasRef.current) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            const ctx = canvas.getContext("2d")!;
            ctx.font = "22px Monaco";
            ctx.scale(scale, scale);
            setCtx(ctx);
        }
    });

    // Refresh scene
    useEffect(() => {
        draw();
    }, [elements, editingElement, dimensions, selectedElement])

    function draw() {
        if (ctx) {
            // Clear scene
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);

            // First draw all elements created till now
            elements.forEach(element => {
                drawElement(ctx, element);
            });

            // draw current editing element
            editingElement && drawElement(ctx, editingElement);

            // draw selection indicator
            if (selectedElement) {
                switch (selectedElement.type) {
                    case ElementType.Rectangle:
                        drawRectangleOutline(ctx, selectedElement);
                        break;
                    case ElementType.Line:
                        drawLineOutline(ctx, selectedElement);
                        break;
                    case ElementType.Arrow:
                        drawArrowOutline(ctx, selectedElement);
                        break;
                }
            }
        }
    }

    function drawRectangleOutline(ctx: CanvasRenderingContext2D, rectangle: Rectangle) {
        const x = rectangle.x - X_SCALE;
        const y = rectangle.y - Y_SCALE;

        drawDashedRect(ctx, x, y, rectangle.width*X_SCALE + X_SCALE, rectangle.height * Y_SCALE + Y_SCALE);
    }

    function drawLineOutline(ctx: CanvasRenderingContext2D, line: Line) {
        const { xMin, xMax, yMin, yMax } = getLinearBounding(
            { x : line.x, y: line.y },
            line.len,
            line.direction === LineDirection.Horizontal
        );
        drawDashedRect(ctx, xMin, yMin, xMax - xMin, yMax - yMin);
    }

    function drawArrowOutline(ctx: CanvasRenderingContext2D, arrow: Arrow) {
        const { xMin, xMax, yMin, yMax } = getLinearBounding(
            { x : arrow.x, y: arrow.y },
            arrow.len,
            arrow.direction === ArrowDirection.Left || arrow.direction === ArrowDirection.Right
        );
        drawDashedRect(ctx, xMin, yMin, xMax - xMin, yMax - yMin);
    }

    function drawDashedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
        const lineDash = ctx.getLineDash();
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash(lineDash);
    }

    // Reset Select
    useEffect(() => {
        if (selectedElement && tool !== Tool.Select) {
            setSelectedElement(null);
        }
    }, [tool]);

    return (
        <canvas id="canvas"
            ref={canvasRef}
            width={dimensions.width * scale}
            height={dimensions.height * scale}
            style={styles}
            aria-label="ascii canvas"
            onMouseDown={(e) => {
                let newElement;
                switch (tool) {
                    case Tool.Rectangle:
                        newElement = newRectangle(clipToScale(e.clientX, X_SCALE), clipToScale(e.clientY, Y_SCALE), 2, 2);
                        break;
                    case Tool.Line:
                        newElement = newLine(clipToScale(e.clientX, X_SCALE),  clipToScale(e.clientY, Y_SCALE), 1);
                        break;
                    case Tool.Arrow:
                        newElement = newArrow(clipToScale(e.clientX, X_SCALE),  clipToScale(e.clientY, Y_SCALE), 2);
                        break;
                    case Tool.Select:
                        const selected = elements.find(element => inVicinity({x: e.clientX, y: e.clientY}, element));
                        if (selected) {
                            setSelectedElement(selected);
                            setDragging(true); // GTK: Does these calls get batched in React??
                        }
                        break;
                }
                newElement && setEditingElement(newElement);
            }}
            onMouseUp={(e) => {
                if (tool !== Tool.Select) {
                    editingElement && setElements([...elements, santizeElement(editingElement)]);
                    setEditingElement(null);
                } else {
                    setDragging(false);
                }
            }}
            // TODO: Need to clean this up
            onMouseMove={(e) => {
                // Accumulate mouse movement into batches of scale
                // TODO: How to handle this for different screen resolutions?
                mouseAccX += e.clientX - mousePreviousX;
                mouseAccY += e.clientY - mousePreviousY;

                const widthIncr = mouseAccX > 0 ? Math.floor(mouseAccX/X_SCALE) : Math.ceil(mouseAccX/X_SCALE);
                const heightIncr = mouseAccY > 0 ? Math.floor(mouseAccY/Y_SCALE) : Math.ceil(mouseAccY/Y_SCALE);

                if (editingElement) {
                    switch (editingElement.type) {
                        case ElementType.Rectangle:
                            let {x, y, width, height} = editingElement;
                            width = width + widthIncr;
                            height = height + heightIncr;
    
                            // Min width and height is 2.
                            // We need to skip 1,0 and -1 to any kind of jumpiness when moving from positive to negative or vice versa
                            if (width <= 1 && width >= -1) {
                                if (widthIncr < 0) { // if decreasing
                                    width = -3
                                } else {
                                    width = 3;
                                }
                            }
    
                            if (height <= 1 && height >= -1) {
                                if (heightIncr < 0) { // if decreasing
                                    height = -3
                                } else {
                                    height = 3;
                                }
                            }
    
                            if (width < 0) {
                                x = x + widthIncr * X_SCALE;
                            }
    
                            if (height < 0) {
                                y = y + heightIncr * Y_SCALE;
                            }
    
                            // Editing element can temporarily have negative width and height
                            setEditingElement({
                                ...editingElement,
                                x,
                                y,
                                width,
                                height,
                                shape: g.rectangle(Math.abs(width), Math.abs(height))
                            });
                            break;
                        case ElementType.Line:
                            // Decide direction if not present
                            if (editingElement.direction === LineDirection.Undecided) {
                                if (widthIncr !== 0) {
                                    editingElement.direction = LineDirection.Horizontal;
                                }
                                if (heightIncr !== 0) {
                                    editingElement.direction = LineDirection.Vertical;
                                }
                            }
        
                            // Start drawing if we only know the direction
                            if (editingElement.direction !== LineDirection.Undecided) {
                                switch (editingElement.direction) {
                                    case LineDirection.Horizontal:
                                        editingElement.len += widthIncr;
                                        break;
                                    case LineDirection.Vertical:
                                        editingElement.len += heightIncr;
                                        break;
                                }
        
                                setEditingElement({
                                    ...editingElement,
                                    shape: g.line(editingElement.len, editingElement.direction === LineDirection.Horizontal)
                                });
                            }
    
                            break;
                        case ElementType.Arrow:
                            // Decide direction if not present
                            if (editingElement.direction === ArrowDirection.Undecided) {
                                widthIncr > 0 && (editingElement.direction = ArrowDirection.Right);
                                widthIncr < 0 && (editingElement.direction = ArrowDirection.Left);
                                heightIncr > 0 && (editingElement.direction = ArrowDirection.Down);
                                heightIncr < 0 && (editingElement.direction = ArrowDirection.Up);
                            }
    
                            // Start drawing if we only know the direction
                            if (editingElement.direction !== ArrowDirection.Undecided) {
                                switch (editingElement.direction) {
                                    case ArrowDirection.Right:
                                        editingElement.len += widthIncr;
                                        break;
                                    case ArrowDirection.Left:
                                        editingElement.x = editingElement.x + widthIncr * X_SCALE;
                                        editingElement.len -= widthIncr;
                                        break;
                                    case ArrowDirection.Down:
                                        editingElement.len += heightIncr;
                                        break;
                                    case ArrowDirection.Up:
                                        editingElement.y = editingElement.y + heightIncr * Y_SCALE;
                                        editingElement.len -= heightIncr;
                                        break;
                                }
    
                                setEditingElement({
                                    ...editingElement,
                                    shape: g.arrow(editingElement.len, editingElement.direction)
                                });
                            }
                            break;
                    }
                } else {
                    // TODO: Remove direct mutation and manual draw
                    if (dragging && selectedElement) {
                        selectedElement.x = selectedElement.x + e.clientX - mousePreviousX;
                        selectedElement.y = selectedElement.y + e.clientY - mousePreviousY;
                        draw();
                    }
                }

                mouseAccX = mouseAccX % X_SCALE;
                mouseAccY = mouseAccY % Y_SCALE;

                mousePreviousX = e.clientX;
                mousePreviousY = e.clientY;
            }}
        >
            <div>Test</div>
        </canvas>
    );
}

export default Canvas;

