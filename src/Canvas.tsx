import { useEffect, useRef, useState } from "react";
import { debounce  } from "lodash";

function Canvas(): JSX.Element {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

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
            const ctx = canvas.getContext("2d")!; // TODO: better error handling?
            ctx.font = "24px Monaco";
            ctx.scale(scale, scale);
            // TODO: Get draw from props and with state observers?
            ctx.fillText("FlarePen!", 100, 100);
        }
    });

    return (
        <canvas id="canvas"
            ref={canvasRef}
            width={dimensions.width * scale}
            height={dimensions.height * scale}
            style={styles}
            aria-label="ascii canvas">
            <div>Test</div>
        </canvas>
    );
}

export default Canvas;

