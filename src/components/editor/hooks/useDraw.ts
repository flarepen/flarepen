import { useEffect } from 'react';
import { X_SCALE, Y_SCALE } from '../../../constants';
import draw from '../../../draw';
import {
  Element,
  ElementType,
  ElementUtils,
  ElementUtilsMap,
  RectangleUtils,
} from '../../../element';
import { useStore } from '../../../state';
import { useCanvasColors } from './useCanvasColors';
import * as g from '../../../geometry';
import _ from 'lodash';

function utilFor(element: Element): ElementUtils<any> {
  return ElementUtilsMap[element.type]!;
}

export function useDraw() {
  const elements = useStore((state) => state.elements);
  const draft = useStore((state) => state.draft);
  const selectedIds = useStore((state) => state.selectedIds);
  const dimensions = useStore((state) => state.dimensions);
  const selectionBox = useStore((state) => state.selectionBox);
  const ctx = useStore((state) => state.canvasCtx);

  const canvasColors = useCanvasColors();

  // Refresh scene
  useEffect(() => {
    drawScene();
  }, [elements, draft, dimensions, selectedIds, canvasColors, selectionBox]);

  function drawScene() {
    if (ctx) {
      // Clear scene
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // First draw all elements created till now
      elements.forEach((element) => {
        draw.element(ctx, element);
      });

      // draw current draft
      draft && draw.element(ctx, draft);

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

      // Resize Experiment
      if (selectedIds.length === 1 && selectionBox.status !== 'active') {
        const element = _.find(elements, (elem) => elem.id === selectedIds[0])!;
        if (element.type !== ElementType.Text) {
          utilFor(element)
            .allEditHandles(element)
            .forEach((handle) =>
              draw.rect(
                ctx,
                handle.bounds,
                canvasColors.selection,
                canvasColors.selectionBackground
              )
            );
        }
      }
    }
  }
}
