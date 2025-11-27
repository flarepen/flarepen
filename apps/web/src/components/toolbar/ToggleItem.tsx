import { actions } from '../../state';
import { Tool } from '../../tools';
import Button from '../Button';
import ToolTip from '../ToolTip';
import { styled } from '../../stitches.config';

interface ToggleItemProps {
  selected: Tool;
  item: Tool;
  children: JSX.Element;
  toolTip: string;
  shortcut?: string;
  className?: string;
}

const ButtonWrapper = styled('div', {
  position: 'relative',
  display: 'inline-flex',
});

const ShortcutIndicator = styled('span', {
  position: 'absolute',
  bottom: 4,
  right: 4,
  fontSize: 8,
  fontWeight: 600,
  color: '$actionText',
  opacity: 0.5,
  pointerEvents: 'none',
  fontFamily: 'monospace',
});

function ToggleItem({ selected, children, item, toolTip, shortcut, className }: ToggleItemProps) {
  return (
    <ToolTip toolTip={toolTip}>
      <ButtonWrapper>
        <Button
          className={className}
          toggled={selected === item}
          onClick={() => {
            actions.setTool(item);
          }}
        >
          {children}
        </Button>
        {shortcut && <ShortcutIndicator>{shortcut}</ShortcutIndicator>}
      </ButtonWrapper>
    </ToolTip>
  );
}

export default ToggleItem;
