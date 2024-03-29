import _ from 'lodash';
import { Element } from '../../element';
import { useStore } from '../../state';
import Canvas from './Canvas';
import DimensionIndicator from './DimensionIndicator';
import { OverlayGrid } from './SvgGrid';

function Editor() {
  const elements = useStore((state) => state.elements);
  const selectedIds = useStore((state) => state.selectedIds);
  const selectedGroupIds = useStore((state) => state.selectedGroupIds);
  const draft = useStore((state) => state.draft);
  const showGrid = useStore((state) => state.showGrid);

  let element: Element | null = null;

  if (selectedIds.length === 1 && selectedGroupIds.length === 0) {
    element = elements[selectedIds[0]];
  }

  if (draft && !element) {
    element = draft.element;
  }

  return (
    <>
      <Canvas></Canvas>
      {element && <DimensionIndicator element={element} />}
      {showGrid && <OverlayGrid />}
    </>
  );
}

export default Editor;
