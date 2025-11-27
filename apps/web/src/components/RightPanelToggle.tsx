import { useStore } from '../state';
import { toggleRightPanel } from '../state/actions/ui';
import Button from './Button';
import { SidebarRightIcon } from './icons';
import ToolTip from './ToolTip';

export function RightPanelToggle(): JSX.Element {
  const rightPanelOpen = useStore((state) => state.rightPanel.isOpen);

  return (
    <ToolTip toolTip="Properties">
      <Button onClick={toggleRightPanel} toggled={rightPanelOpen}>
        <SidebarRightIcon />
      </Button>
    </ToolTip>
  );
}
