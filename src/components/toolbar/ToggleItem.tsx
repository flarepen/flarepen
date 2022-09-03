import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { styled } from '../../stitches.config';

interface ToggleItemProps {
  tool: string;
  icon?: any;
  className?: string;
}

function ToggleItem({ tool, icon, className }: ToggleItemProps) {
  const content = icon ? icon : tool;
  return (
    <ToolbarPrimitive.ToolbarToggleItem className={className} value={tool}>
      {content}
    </ToolbarPrimitive.ToolbarToggleItem>
  );
}

const StyledToggleItem = styled(ToggleItem, {
  all: 'unset',
  height: 25,
  cursor: 'pointer',
  padding: '0 5px',
  borderRadius: 4,
  display: 'inline-flex',
  color: '$secondary',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$background',
  marginLeft: 2,
  '&:first-child': { marginLeft: 0 },
  '&:hover': { backgroundColor: '$primaryBackgroundDim' },
  '&[data-state=on]': {
    backgroundColor: '$primaryBackground',
    color: '$primary',
  },
});

export default StyledToggleItem;
