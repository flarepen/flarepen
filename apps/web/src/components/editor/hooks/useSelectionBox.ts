import _ from 'lodash';
import { expandIBound, insideBound } from '../../../element';
import { actions, useStore } from '../../../state';
import { MouseMove } from '../../../types';

export function useSelectionBox() {
  const elements = useStore((state) => state.elements);
  const selectionBox = useStore((state) => state.selectionBox);
  const selectedIds = useStore((state) => state.selectedIds);
  const setSelected = actions.setSelected;

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

  const expand = (mouseMove: MouseMove) => {
    selectionBox.status === 'pending' && active();

    if (
      selectionBox.bounds &&
      (selectionBox.status === 'pending' || selectionBox.status === 'active')
    ) {
      const toSelect = _.map(
        _.filter(_.values(elements), (element) => insideBound(element, selectionBox.bounds!)),
        (element) => element.id
      );
      selectionBox.bounds &&
        actions.setSelectionBox({
          bounds: expandIBound(selectionBox.bounds, mouseMove),
        });

      if (!_.isEqual(selectedIds, toSelect)) {
        setSelected(toSelect);
      }
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
