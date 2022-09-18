import _ from 'lodash';
import * as g from '../../geometry';
import { useStore, actions } from '../../state';
import Button from '../Button';
import { ClipboardCopyIcon, DeleteIcon, GridIcon } from '../icons';

function ActionGroup(): JSX.Element {
  const elements = useStore((state) => state.elements);

  const selectedIds = useStore((state) => state.selectedIds);
  const setSelected = actions.setSelected;
  const deleteElement = actions.deleteElement;

  const showGrid = useStore((state) => state.showGrid);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => console.log(text),
      () => console.log('copy failed')
    );
  }

  function handleDelete() {
    if (selectedIds.length === 0) {
      return null;
    }

    selectedIds.forEach((selectedId) => {
      deleteElement(selectedId);
    });
    setSelected([]);
  }

  function handleCopy() {
    let elementsToCopy = elements;
    if (selectedIds.length > 0) {
      elementsToCopy = _.filter(elements, (element) => selectedIds.includes(element.id));
    }
    const merged = g.merge(elementsToCopy);
    copyToClipboard(_.map(merged.content, (row) => row.join('')).join('\n'));
  }

  function flipGrid() {
    actions.setShowGrid(!showGrid);
  }

  return (
    <>
      <Button onClick={flipGrid} toggled={showGrid}>
        <GridIcon />
      </Button>
      <Button onClick={handleCopy}>
        <ClipboardCopyIcon />
      </Button>
      <Button onClick={handleDelete} inactive={selectedIds.length === 0}>
        <DeleteIcon />
      </Button>
    </>
  );
}

export default ActionGroup;
