import { useEffect } from 'react';
import { X_SCALE, Y_SCALE } from '../../../constants';
import draw, { withOpacity } from '../../../draw';
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
import { ElementGroup } from '../../../types';

function utilFor(element: Element): ElementUtils<any> {
  return ElementUtilsMap[element.type]!;
}

export function useDraw() {
  const elements = useStore((state) => state.elements);
  const groups = useStore((state) => state.groups);
  const draft = useStore((state) => state.draft);
  const selectedIds = useStore((state) => state.selectedIds);
  const selectedGroupIds = useStore((state) => state.selectedGroupIds);
  const dimensions = useStore((state) => state.dimensions);
  const selectionBox = useStore((state) => state.selectionBox);
  const ctx = useStore((state) => state.canvasCtx);
  const dragging = useStore((state) => state.dragging);
  const currentCell = useStore((state) => state.currentCell);
  const editingContext = useStore((state) => state.editingContext);

  const canvasColors = useCanvasColors();

  const selectedElements = _.map(selectedIds, (selectedId) => elements[selectedId]);
  const selectedGroups = _.map(selectedGroupIds, (selectedGroupdId) => groups[selectedGroupdId]);

  // Refresh scene
  useEffect(() => {
    window.requestAnimationFrame(drawScene);
  }, [elements, draft, dimensions, selectedIds, selectedGroupIds, canvasColors, selectionBox]);

  function getBoundsForGroup(group: ElementGroup) {
    const elementsInGroup = _.map(group.elementIds, (selectedId) => elements[selectedId]);

    const bounds = g.getBoundingRectForBounds(
      _.map(elementsInGroup, (element) => utilFor(element).outlineBounds(element))
    );

    return {
      x: bounds.x - X_SCALE / 2,
      y: bounds.y - Y_SCALE / 2,
      width: bounds.width + X_SCALE,
      height: bounds.height + Y_SCALE,
    };
  }

  function drawSelected() {
    draw.merged(ctx!, g.merge(_.values(elements)));
  }

  function drawSelectionOutlines() {
    if (selectedIds.length + selectedGroups.length === 0) {
      return null;
    }

    // Draw only the outline
    if (selectedElements.length + selectedGroups.length === 1) {
      const selectedElement = selectedElements[0];
      const selectedGroup = selectedGroups[0];

      if (selectedElement) {
        draw.rect(
          ctx!,
          utilFor(selectedElement).outlineBounds(selectedElement),
          canvasColors.selection,
          canvasColors.selectionBackground
        );
      }

      if (selectedGroup) {
        draw.rect(
          ctx!,
          getBoundsForGroup(selectedGroup),
          canvasColors.selection,
          canvasColors.selectionBackground
        );
      }

      return null;
    }

    const elementBounds = _.map(selectedElements, (element) =>
      utilFor(element).outlineBounds(element)
    );
    const groupBounds = _.map(selectedGroups, (group) => getBoundsForGroup(group));

    const allBounds = elementBounds.concat(groupBounds);

    allBounds.forEach((bound) => {
      draw.rect(ctx!, bound, canvasColors.selection, canvasColors.selectionBackground);
    });

    // Draw extra dashed outline over all the elements

    if (selectionBox.status !== 'active') {
      const bounds = g.getBoundingRectForBounds(allBounds);

      draw.dashedRect(
        ctx!,
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

  function drawScene() {
    if (ctx) {
      // Clear scene
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      drawSelected();

      // Highlight cell when not in draft or edit mode.
      if (
        currentCell &&
        !(selectionBox.status === 'active') &&
        !draft &&
        !editingContext.id &&
        !editingContext.handleType &&
        !dragging
      ) {
        draw.rect(
          ctx,
          {
            x: currentCell.x,
            y: currentCell.y,
            width: X_SCALE,
            height: Y_SCALE,
          },
          withOpacity(canvasColors.cellHighlight, 0.1),
          canvasColors.cellHighlight
        );
      }

      // draw current draft
      draft && draw.element(ctx, draft);

      drawSelectionOutlines();

      // Selection Box
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

      // Edit Handles
      if (
        selectedIds.length === 1 &&
        selectedGroupIds.length === 0 &&
        selectionBox.status !== 'active'
      ) {
        const element = elements[selectedIds[0]];
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
