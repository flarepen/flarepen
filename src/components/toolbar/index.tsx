import * as ToolbarPrimitive from '@radix-ui/react-toolbar';

import { styled } from '../../stitches.config';
import ToolGroup from './ToolGroup';
import ActionGroup from './ActionGroup';

const Separator = styled(ToolbarPrimitive.Separator, {
  width: 1,
  backgroundColor: '$secondaryBackground',
  margin: '0 10px',
});

const ToolBar = styled(ToolbarPrimitive.Root, {
  display: 'flex',
  padding: 6,
  borderRadius: 6,
  backgroundColor: '$background',
  border: `1px solid $border`,
  zIndex: 10,
});

export { ToolBar, Separator, ToolGroup, ActionGroup };
