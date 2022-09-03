import { mauve } from '@radix-ui/colors';
import { styled } from '@stitches/react';
import { useStore } from '../state';
import Button from './Button';
import { RedoIcon, UndoIcon } from './icons';

interface UndoRedoProps {
  className?: string;
}
function UndoRedo({ className }: UndoRedoProps): JSX.Element {
  const past = useStore((state) => state.past);
  const future = useStore((state) => state.future);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);

  const canRedo = future.length > 0;
  const canUndo = past.length > 0;

  return (
    <div className={className}>
      <Button inactive={!canUndo} onClick={undo}>
        <UndoIcon />
      </Button>
      <Button inactive={!canRedo} onClick={redo}>
        <RedoIcon />
      </Button>
    </div>
  );
}

export default styled(UndoRedo, {
  right: 10,
  top: 10,
  position: 'absolute',
  border: `1px solid ${mauve.mauve9}`,
  padding: 4,
  borderRadius: 6,
});
