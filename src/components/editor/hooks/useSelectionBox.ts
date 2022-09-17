import _ from 'lodash';
import draw from '../../../draw';
import { expandIBound, insideBound } from '../../../element';
import { actions, useStore } from '../../../state';
import { IMouseMove } from '../../../types';
import { useCanvasColors } from './useCanvasColors';

export function useSelectionBox() {
  const ctx = useStore((state) => state.canvasCtx);
  const elements = useStore((state) => state.elements);
  const selectionBox = useStore((state) => state.selectionBox);
  const setSelected = actions.setSelected;
  const canvasColors = useCanvasColors();

  const init = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    actions.setSelectionBox({
      status: 'pending',
      bounds: {
        x: e.clientX,
        y: e.clientY,
        width: 0,
        height: 0,
      },
    });
  };

  const active = () => {
    actions.setSelectionBox({ status: 'active' });
  };

  const inactive = () => {
    actions.setSelectionBox({
      status: 'inactive',
      bounds: null,
    });
  };

  const expand = (mouseMove: IMouseMove) => {
    selectionBox.status === 'pending' && active();

    if (
      selectionBox.bounds &&
      (selectionBox.status === 'pending' || selectionBox.status === 'active')
    ) {
      const toSelect = _.map(
        _.filter(elements, (element) => insideBound(element, selectionBox.bounds!)),
        (element) => element.id
      );
      selectionBox.bounds &&
        actions.setSelectionBox({
          bounds: expandIBound(selectionBox.bounds, mouseMove),
        });
      setSelected(toSelect);
    }
  };

  return [
    selectionBox,
    {
      init,
      active,
      inactive,
      expand,
    },
  ] as const;
}
