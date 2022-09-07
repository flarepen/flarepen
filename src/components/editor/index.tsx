import _ from 'lodash';
import { Element } from '../../element';
import { useStore } from '../../state';
import Canvas from './Canvas';
import DimensionIndicator from './DimensionIndicator';
import { OverlayGrid } from './Grid';

function Editor() {
  const elements = useStore((state) => state.elements);
  const selectedIds = useStore((state) => state.selectedIds);
  const editingElement = useStore((state) => state.editingElement);
  const showGrid = useStore((state) => state.showGrid);

  let element: Element | null = null;

  if (selectedIds.length === 1) {
    element = _.find(elements, (elem) => elem.id === selectedIds[0])!;
  }

  element = element || editingElement;

  return (
    <>
      <Canvas></Canvas>
      {element && <DimensionIndicator element={element} />}
      {showGrid && <OverlayGrid />}
    </>
  );
}

export default Editor;
