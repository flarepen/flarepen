import { styled } from '../stitches.config';
import { useStore, actions } from '../state';
import Button from './Button';
import { RedoIcon, UndoIcon } from './icons';

interface UndoRedoProps {
  className?: string;
}
function UndoRedo({ className }: UndoRedoProps): JSX.Element {
  const past = useStore((state) => state.past);
  const future = useStore((state) => state.future);
  const canRedo = future.length > 0;
  const canUndo = past.length > 0;

  return (
    <div className={className}>
      <Button inactive={!canUndo} onClick={actions.undo}>
        <UndoIcon />
      </Button>
      <Button inactive={!canRedo} onClick={actions.redo}>
        <RedoIcon />
      </Button>
    </div>
  );
}

export default styled(UndoRedo, {
  left: 10,
  bottom: 10,
  position: 'absolute',
  border: '1px solid $border',
  backgroundColor: '$background',
  padding: 4,
  borderRadius: 6,
  zIndex: 10,
});
