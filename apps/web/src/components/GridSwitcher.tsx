import { actions, useStore } from '../state';
import Button from './Button';
import { GridIcon } from './icons';
import ToolTip from './ToolTip';

export function GridSwitcher(): JSX.Element {
  const showGrid = useStore((state) => state.showGrid);

  function flipGrid() {
    actions.setShowGrid(!showGrid);
  }

  return (
    <ToolTip toolTip="Grid">
      <Button onClick={flipGrid} toggled={showGrid}>
        <GridIcon />
      </Button>
    </ToolTip>
  );
}
