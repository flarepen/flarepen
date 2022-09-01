import * as ToolbarPrimitive from '@radix-ui/react-toolbar';

import { styled } from '@stitches/react';
import { mauve } from '@radix-ui/colors';
import ToggleGroup from './ToggleGroup';
import ActionGroup from './ActionGroup';

const Separator = styled(ToolbarPrimitive.Separator, {
  width: 1,
  backgroundColor: mauve.mauve6,
  margin: '0 10px',
});

const ToolBar = styled(ToolbarPrimitive.Root, {
  left: 10,
  top: 10,
  float: 'left',
  position: 'absolute',
  display: 'flex',
  padding: '10px',
  borderRadius: 6,
  boxShadow: `0 2px 10px ${mauve.mauve7}`,
});

export { ToolBar, Separator, ToggleGroup, ActionGroup };
