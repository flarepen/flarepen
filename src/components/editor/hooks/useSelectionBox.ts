import _ from 'lodash';
import { useState } from 'react';
import draw from '../../../draw';
import { expandIBound, IBounds, insideBound } from '../../../element';
import { actions, useStore } from '../../../state';
import { IMouseMove } from '../../../types';
import { useCanvasColors } from './useCanvasColors';

export type SelectionBoxStatus = 'inactive' | 'active' | 'pending';

export function useSelectionBox() {
  const [status, setSelectionBoxStatus] = useState<SelectionBoxStatus>('inactive');
  const [bounds, setSelectionBox] = useState<null | IBounds>(null);
  const ctx = useStore((state) => state.canvasCtx);
  const elements = useStore((state) => state.elements);
  const setSelected = actions.setSelected;
  const canvasColors = useCanvasColors();

  const init = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setSelectionBoxStatus('pending');
    setSelectionBox({
      x: e.clientX,
      y: e.clientY,
      width: 0,
      height: 0,
    });
  };

  const active = () => {
    setSelectionBoxStatus('active');
  };

  const inactive = () => {
    setSelectionBoxStatus('inactive');
    setSelectionBox(null);
  };

  const expand = (mouseMove: IMouseMove) => {
    status === 'pending' && active();

    if (bounds && (status === 'pending' || status === 'active')) {
      const toSelect = _.map(
        _.filter(elements, (element) => insideBound(element, bounds)),
        (element) => element.id
      );
      bounds && setSelectionBox(expandIBound(bounds, mouseMove));
      setSelected(toSelect);
    }
  };

  const drawSelection = () => {
    ctx &&
      bounds &&
      draw.dashedRect(
        ctx,
        {
          ...bounds,
          width: Math.abs(bounds.width),
          height: Math.abs(bounds.height),
        },
        canvasColors.selection,
        canvasColors.selectionBackground,
        [4, 2]
      );
  };

  return [
    { bounds, status },
    {
      init,
      active,
      inactive,
      expand,
      draw: drawSelection,
    },
  ] as const;
}
