import _ from 'lodash';
import { Element } from '../../element';
import { useStore } from '../../state';
import Canvas from './Canvas';
import DimensionIndicator from './DimensionIndicator';
import { OverlayGrid } from './grid';

function Editor() {
  const elements = useStore((state) => state.elements);
  const selectedIds = useStore((state) => state.selectedIds);
  const editingElement = useStore((state) => state.editingElement);

  let element: Element | null = null;

  if (selectedIds.length === 1) {
    element = _.find(elements, (elem) => elem.id === selectedIds[0])!;
  }

  element = element || editingElement;

  return (
    <>
      <Canvas></Canvas>
      {element && <DimensionIndicator element={element} />}
      <OverlayGrid />
    </>
  );
}

export default Editor;
