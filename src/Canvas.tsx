import { useEffect, useState } from "react";
import { debounce  } from "lodash";

function Canvas(): JSX.Element {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

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

    return (
        <canvas width={dimensions.width} height={dimensions.height} aria-label="ascii canvas">
            <div>Test</div>
        </canvas>
    );
}

export default Canvas;

