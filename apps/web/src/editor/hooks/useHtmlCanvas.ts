import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { actions, useStore } from '../../state';
import { useCanvasColors } from './useCanvasColors';

export function useHtmlCanvas() {
  const dimensions = useStore((state) => state.dimensions);
  const canvasColors = useCanvasColors();

  const canvasRef = useRef(null);
  const scale = window.devicePixelRatio;

  // Handle Resize
  useEffect(() => {
    function handleWindowResize() {
      // Get toolbar height dynamically or use a fixed value
      // The toolbar is roughly 48-56px high (content + padding + border)
      const toolbarHeight = document.querySelector('[class*="ToolbarContainer"]')?.clientHeight || 48;

      actions.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - toolbarHeight,
      });
    }

    // Set initial dimensions
    handleWindowResize();

    const debouncedHandler = debounce(handleWindowResize, 100);

    window.addEventListener('resize', debouncedHandler);

    return () => window.removeEventListener('resize', debouncedHandler);
  }, []);

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

      const primaryColor = canvasColors.text;

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
  }, [dimensions, canvasColors]);

  return canvasRef;
}
