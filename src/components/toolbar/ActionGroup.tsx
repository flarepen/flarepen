import { scene } from '../../geometry';
import { useStore } from '../../state';
import Button from '../Button';
import { ClipboardCopyIcon, DeleteIcon } from '../icons';

function ActionGroup(): JSX.Element {
  const elements = useStore((state) => state.elements);

  const selectedIds = useStore((state) => state.selectedIds);
  const resetSelected = useStore((state) => state.resetSelected);
  const deleteElement = useStore((state) => state.deleteElement);

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
    resetSelected([]);
  }

  function handleCopy() {
    copyToClipboard(scene(elements));
  }
  return (
    <>
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
