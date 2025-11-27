import { styled } from '@stitches/react';
import _ from 'lodash';
import { alignElements, AlignType } from '../../state/actions';
import { useStore } from '../../state';
import Button from '../Button';
import {
  AlignBottomIcon,
  AlignCenterXIcon,
  AlignCenterYIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
} from '../icons';
import ToolTip from '../ToolTip';

interface AlignOptionsProps {
  className?: string;
  disabled?: boolean;
}

const Row = styled('div', {
  display: 'flex',
});

function getAlignHandler(alignType: AlignType, disabled: boolean) {
  return () => {
    if (disabled) return;
    alignElements(alignType);
  };
}

const ALIGN_OPTION_ICONS = {
  left: <AlignLeftIcon />,
  right: <AlignRightIcon />,
  center_x: <AlignCenterXIcon />,
  top: <AlignTopIcon />,
  bottom: <AlignBottomIcon />,
  center_y: <AlignCenterYIcon />,
};

const ALIGN_OPTION_TOOLTIPS = {
  left: 'Align Left',
  right: 'Align Right',
  center_x: 'Align Horizontal Center',
  top: 'Align Top',
  bottom: 'Align Bottom',
  center_y: 'Align Vertical Center',
};

const ALIGN_OFFSET = {
  left: 34,
  right: 34,
  center_x: 34,
  top: 10,
  bottom: 10,
  center_y: 10,
};

interface AlignOptionProps {
  alignType: AlignType;
  disabled?: boolean;
}

function AlignOption({ alignType, disabled }: AlignOptionProps): JSX.Element {
  return (
    <ToolTip
      toolTip={ALIGN_OPTION_TOOLTIPS[alignType]}
      sideOffset={ALIGN_OFFSET[alignType]}
      side={'bottom'}
    >
      <Button onClick={getAlignHandler(alignType, disabled || false)} inactive={disabled}>
        {ALIGN_OPTION_ICONS[alignType]}
      </Button>
    </ToolTip>
  );
}

function AlignOptions({ className, disabled }: AlignOptionsProps): JSX.Element {
  return (
    <div className={className}>
      <Row>
        <AlignOption alignType="left" disabled={disabled} />
        <AlignOption alignType="center_x" disabled={disabled} />
        <AlignOption alignType="right" disabled={disabled} />
        <AlignOption alignType="top" disabled={disabled} />
        <AlignOption alignType="center_y" disabled={disabled} />
        <AlignOption alignType="bottom" disabled={disabled} />
      </Row>
    </div>
  );
}

export default styled(AlignOptions, {
  display: 'flex',
  flexDirection: 'column',
  gap: 2, // Small gap between rows
  alignItems: 'center',
  justifyContent: 'center',
});
