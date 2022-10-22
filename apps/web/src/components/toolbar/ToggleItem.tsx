import { actions } from '../../state';
import { Tool } from '../../tools';
import Button from '../Button';
import ToolTip from '../ToolTip';

interface ToggleItemProps {
  selected: Tool;
  item: Tool;
  children: JSX.Element;
  toolTip: string;
  className?: string;
}

function ToggleItem({ selected, children, item, toolTip, className }: ToggleItemProps) {
  return (
    <ToolTip toolTip={toolTip}>
      <Button
        className={className}
        toggled={selected === item}
        onClick={() => {
          actions.setTool(item);
        }}
      >
        {children}
      </Button>
    </ToolTip>
  );
}

export default ToggleItem;
