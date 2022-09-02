import _ from 'lodash';
import { Element } from '../../element';
import { useStore } from '../../state';
import Canvas from './Canvas';
import DimensionIndicator from './DimensionIndicator';

function Editor() {
  const elements = useStore((state) => state.elements);
  const selectedId = useStore((state) => state.selectedId);
  const editingElement = useStore((state) => state.editingElement);

  let element: Element | null = null;

  if (selectedId) {
    element = _.find(elements, (elem) => elem.id === selectedId)!;
  }

  element = element || editingElement;

  return (
    <>
      <Canvas></Canvas>
      {element && <DimensionIndicator element={element} />}
    </>
  );
}

export default Editor;
