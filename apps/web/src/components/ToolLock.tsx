import { useStore, actions } from '../state';
import Button from './Button';
import { LockIcon, UnlockIcon } from './icons';
import ToolTip from './ToolTip';

export function ToolLock(): JSX.Element {
  const toolLocked = useStore((state) => state.toolLocked);

  const icon = toolLocked ? <LockIcon /> : <UnlockIcon />;
  const toolTip = toolLocked ? 'Unlock' : 'Lock';
  return (
    <ToolTip toolTip={toolTip}>
      <Button
        onClick={() => {
          toolLocked ? actions.setToolLocked(false) : actions.setToolLocked(true);
        }}
      >
        {icon}
      </Button>
    </ToolTip>
  );
}
