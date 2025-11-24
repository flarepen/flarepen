import { InteractionMode } from '../../types';
import { IdleMode } from './idle';
import { PanningMode } from './panning';
import { DrawingMode } from './drawing';
import { TextEditingMode } from './textEditing';
import { SelectingMode } from './selecting';
import { DraggingMode } from './dragging';
import { EditingMode } from './editing';
import { ModeHandler } from './types';

export const getModeHandler = (mode: InteractionMode): ModeHandler => {
  switch (mode.type) {
    case 'idle':
      return IdleMode;
    case 'panning':
      return PanningMode;
    case 'drawing':
      return DrawingMode;
    case 'textEditing':
      return TextEditingMode;
    case 'selecting':
      return SelectingMode;
    case 'dragging':
      return DraggingMode;
    case 'editing':
      return EditingMode;
    default:
      return IdleMode;
  }
};
