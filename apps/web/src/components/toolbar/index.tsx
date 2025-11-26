import * as ToolbarPrimitive from '@radix-ui/react-toolbar';

import { styled } from '../../stitches.config';
import ToolGroup from './ToolGroup';
import ActionGroup from './ActionGroup';

const Separator = styled(ToolbarPrimitive.Separator, {
  backgroundColor: '$seperator',

  variants: {
    orientation: {
      horizontal: {
        height: 1,
        width: 'auto',
        margin: '10px 0',
      },
      vertical: {
        width: 1,
        height: 'auto',
        margin: '0 10px',
      },
    },
  },

  defaultVariants: {
    orientation: 'horizontal',
  },
});

const ToolBar = styled(ToolbarPrimitive.Root, {
  display: 'flex',
  alignItems: 'center',
});

export { ToolBar, Separator, ToolGroup, ActionGroup };
