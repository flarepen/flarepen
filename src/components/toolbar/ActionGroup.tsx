import { scene } from '../../geometry';
import { useStore } from '../../state';
import Button from '../Button';
import { ClipboardCopyIcon, DeleteIcon } from '../icons';

function ActionGroup(): JSX.Element {
  const elements = useStore((state) => state.elements);

  const selectedId = useStore((state) => state.selectedId);
  const setSelectedId = useStore((state) => state.setSelectedId);
  const deleteElement = useStore((state) => state.deleteElement);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => console.log(text),
      () => console.log('copy failed')
    );
  }

  function handleDelete() {
    if (!selectedId) {
      return null;
    }

    deleteElement(selectedId);
    setSelectedId(null);
  }

  function handleCopy() {
    copyToClipboard(scene(elements));
  }
  return (
    <>
      <Button onClick={handleCopy}>
        <ClipboardCopyIcon />
      </Button>
      <Button onClick={handleDelete} inactive={selectedId === null}>
        <DeleteIcon />
      </Button>
    </>
  );
}

export default ActionGroup;
