import { mauve, orange, orangeA } from '@radix-ui/colors';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { styled } from '@stitches/react';

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
  color: mauve.mauve11,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  marginLeft: 2,
  '&:first-child': { marginLeft: 0 },
  '&:hover': { backgroundColor: orange.orange2 },
  '&[data-state=on]': {
    backgroundColor: orange.orange3,
    color: orange.orange10,
  },
});

export default StyledToggleItem;
