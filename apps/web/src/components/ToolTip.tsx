import { styled } from '../stitches.config';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { mauve } from '@radix-ui/colors';

const StyledContent = styled(TooltipPrimitive.Content, {
  fontSize: 14,
  color: '$toolTipText',
  backgroundColor: '$toolTipBg',
  padding: '4px 8px',
  borderRadius: 3,
  marginLeft: 2,
});
export interface ToolTipProps {
  children: JSX.Element;
  toolTip: string;
  sideOffset?: number;
  side?: 'left' | 'right' | 'bottom' | 'top';
}

function ToolTip({ children, toolTip, sideOffset, side }: ToolTipProps) {
  sideOffset = sideOffset || 10;
  return (
    <TooltipPrimitive.Root delayDuration={300}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <StyledContent sideOffset={sideOffset} side={side}>
          {toolTip}
        </StyledContent>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export default ToolTip;
