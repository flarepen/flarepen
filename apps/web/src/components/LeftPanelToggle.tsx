import React from 'react';
import Button from './Button';
import { toggleLeftPanel } from '../state/actions/ui';
import { useStore } from '../state';
import { SidebarLeftIcon } from './icons';
import ToolTip from './ToolTip';

export function LeftPanelToggle() {
  const leftPanelOpen = useStore((state) => state.leftPanel.isOpen);

  return (
    <ToolTip toolTip="Menu">
      <Button onClick={toggleLeftPanel} toggled={leftPanelOpen}>
        <SidebarLeftIcon />
      </Button>
    </ToolTip>
  );
}
