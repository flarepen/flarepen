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
  padding: 6,
  borderRadius: 6,
  border: `1px solid ${mauve.mauve9}`,
});

export { ToolBar, Separator, ToggleGroup, ActionGroup };
