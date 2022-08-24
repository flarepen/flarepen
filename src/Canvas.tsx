import { useEffect, useRef, useState } from "react";
import { debounce  } from "lodash";
import * as g from "./geometry" ;

interface Element {
    x: number,
    y: number,
    shape: g.Shape,
}

interface Rectangle extends Element {
    width: number,
    height: number,
}

function newRectangle(x: number, y: number, width: number, height: number): Rectangle {
    return { x, y, width, height, shape: g.rectangle(width, height) };
}

function drawRectangle(ctx: CanvasRenderingContext2D, rectangle: Rectangle) {
    let x = rectangle.x;
    let y = rectangle.y;
    rectangle.shape.forEach(row => {
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

function Canvas(): JSX.Element {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [ctx, setCtx] = useState<null|CanvasRenderingContext2D>(null);
    const [elements, setElements] = useState<Rectangle[]>([]);
    const [editingElement, setEditingElement] = useState<null|Rectangle>(null);

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

    useEffect(() => {
        draw();
    }, [elements, editingElement, dimensions])

    function draw() {
        if (ctx) {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);
            elements.forEach(element => {
                drawRectangle(ctx, element);
            })
            editingElement && drawRectangle(ctx, editingElement);
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
                setEditingElement(newRectangle(clipToScale(e.clientX, X_SCALE), clipToScale(e.clientY, Y_SCALE), 2, 2));
            }}
            onMouseUp={(e) => {
                editingElement && setElements([...elements, editingElement]);
                setEditingElement(null);
            }}
            onMouseMove={(e) => {
                if (editingElement) {
                    // Accumulate mouse movement into batches of scale
                    // TODO: How to handle this for different screen resolutions?
                    mouseAccX += e.clientX - mousePreviousX;
                    mouseAccY += e.clientY - mousePreviousY;

                    const widthIncr = Math.floor(mouseAccX/X_SCALE);
                    const heightIncr = Math.floor(mouseAccY/Y_SCALE);

                    mouseAccX = mouseAccX % X_SCALE;
                    mouseAccY = mouseAccY % Y_SCALE;

                    const {width, height} = editingElement;
                    const newWidth = width + widthIncr; 
                    const newHeight = height + heightIncr;
                    console.log("x",newWidth, newHeight);
                    setEditingElement({
                        ...editingElement,
                        width: newWidth,
                        height: newHeight,
                        shape: g.rectangle(newWidth, newHeight)
                    })
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

