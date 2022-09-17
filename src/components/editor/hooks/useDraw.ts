import { useEffect } from 'react';
import { X_SCALE, Y_SCALE } from '../../../constants';
import draw from '../../../draw';
import { Element, ElementUtils, ElementUtilsMap } from '../../../element';
import { useStore } from '../../../state';
import { useCanvasColors } from './useCanvasColors';
import * as g from '../../../geometry';
import _ from 'lodash';

function utilFor(element: Element): ElementUtils<any> {
  return ElementUtilsMap[element.type]!;
}

export function useDraw() {
  const elements = useStore((state) => state.elements);
  const editingElement = useStore((state) => state.editingElement);
  const selectedIds = useStore((state) => state.selectedIds);
  const dimensions = useStore((state) => state.dimensions);
  const selectionBox = useStore((state) => state.selectionBox);
  const ctx = useStore((state) => state.canvasCtx);

  const canvasColors = useCanvasColors();

  // Refresh scene
  useEffect(() => {
    drawScene();
  }, [elements, editingElement, dimensions, selectedIds, canvasColors, selectionBox]);

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

        if (selectedElements.length === 1) {
          draw.rect(
            ctx,
            utilFor(selectedElements[0]).outlineBounds(selectedElements[0]),
            canvasColors.selection,
            canvasColors.selectionBackground
          );
        } else {
          const allBounds = _.map(selectedElements, (element) =>
            utilFor(element).outlineBounds(element)
          );

          allBounds.forEach((bound) => {
            draw.rect(ctx, bound, canvasColors.selection, canvasColors.selectionBackground);
          });

          if (selectionBox.status !== 'active') {
            const bounds = g.getBoundingRectForBounds(allBounds);

            draw.dashedRect(
              ctx,
              {
                x: bounds.x - X_SCALE / 2,
                y: bounds.y - Y_SCALE / 2,
                width: bounds.width + X_SCALE,
                height: bounds.height + Y_SCALE,
              },
              canvasColors.selection,
              canvasColors.selectionBackground,
              [4, 2]
            );
          }
        }
      }

      if (selectionBox.status === 'active' && selectionBox.bounds) {
        ctx &&
          selectionBox.bounds &&
          draw.dashedRect(
            ctx,
            {
              ...selectionBox.bounds,
              width: Math.abs(selectionBox.bounds.width),
              height: Math.abs(selectionBox.bounds.height),
            },
            canvasColors.selection,
            canvasColors.selectionBackground,
            [4, 2]
          );
      }

      // // Resize Experiment
      // if (selectedIds.length === 1 && selectionBoxState !== 'active') {
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
      //     ].forEach((xy) =>
      //       draw.rect(
      //         ctx,
      //         { x: xy[0], y: xy[1], width: size, height: size },
      //         colors.selection,
      //         colors.selectionBackground
      //       )
      //     );
      //   }
      // }
    }
  }
}
