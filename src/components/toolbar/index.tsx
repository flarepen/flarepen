import * as ToolbarPrimitive from '@radix-ui/react-toolbar';

import { styled } from '../../stitches.config';
import ToggleGroup from './ToggleGroup';
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
  border: `1px solid $border`,
});

export { ToolBar, Separator, ToggleGroup, ActionGroup };
