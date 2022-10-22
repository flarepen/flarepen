import { styled } from '../stitches.config';
import { useStore, actions } from '../state';
import Button from './Button';
import { RedoIcon, UndoIcon } from './icons';
import ToolTip from './ToolTip';

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
      <ToolTip toolTip="Undo">
        <Button inactive={!canUndo} onClick={actions.undo}>
          <UndoIcon />
        </Button>
      </ToolTip>
      <ToolTip toolTip="Redo">
        <Button inactive={!canRedo} onClick={actions.redo}>
          <RedoIcon />
        </Button>
      </ToolTip>
    </div>
  );
}

export default styled(UndoRedo, {
  // display: 'flex',
  padding: 6,
  borderRadius: 6,
  backgroundColor: '$background',
  border: '1px solid $border',
  zIndex: 10,
});
