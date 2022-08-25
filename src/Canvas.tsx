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
    }, [elements, editingElement, dimensions])

    function draw() {
        if (ctx) {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);
            elements.forEach(element => {
                drawElement(ctx, element);
            })
            editingElement && drawElement(ctx, editingElement);
        }
    }

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
                }
                setEditingElement(newElement);
            }}
            onMouseUp={(e) => {
                editingElement && setElements([...elements, santizeElement(editingElement)]);
                setEditingElement(null);
            }}
            // TODO: Need to clean this up
            onMouseMove={(e) => {
                // Do nothing if we are not editing an element;
                if (!editingElement) {
                    mousePreviousX = e.clientX;
                    mousePreviousY = e.clientY;
                    return null;
                }

                // Accumulate mouse movement into batches of scale
                // TODO: How to handle this for different screen resolutions?
                console.log("acc", mouseAccX, mouseAccY);
                mouseAccX += e.clientX - mousePreviousX;
                mouseAccY += e.clientY - mousePreviousY;

                const widthIncr = mouseAccX > 0 ? Math.floor(mouseAccX/X_SCALE) : Math.ceil(mouseAccX/X_SCALE);
                const heightIncr = mouseAccY > 0 ? Math.floor(mouseAccY/Y_SCALE) : Math.ceil(mouseAccY/Y_SCALE);

                mouseAccX = mouseAccX % X_SCALE;
                mouseAccY = mouseAccY % Y_SCALE;

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
                        console.log(editingElement);
                        console.log(widthIncr, heightIncr);
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

                mousePreviousX = e.clientX;
                mousePreviousY = e.clientY;
            }}
        >
            <div>Test</div>
        </canvas>
    );
}

export default Canvas;

