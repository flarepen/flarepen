import { styled } from '@stitches/react';
import _ from 'lodash';
import { alignElements, AlignType } from '../state/actions';
import { useStore } from '../state';
import Button from './Button';
import {
  AlignBottomIcon,
  AlignCenterXIcon,
  AlignCenterYIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
} from './icons';
import ToolTip from './ToolTip';

interface AlignOptionsProps {
  className?: string;
}

const Row = styled('div', {
  display: 'flex',
});

function getAlignHandler(alignType: AlignType) {
  return () => alignElements(alignType);
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
  inactive: boolean;
}

function AlignOption({ alignType, inactive }: AlignOptionProps): JSX.Element {
  return (
    <ToolTip
      toolTip={ALIGN_OPTION_TOOLTIPS[alignType]}
      sideOffset={ALIGN_OFFSET[alignType]}
      side={'bottom'}
    >
      <Button onClick={getAlignHandler(alignType)} inactive={inactive}>
        {ALIGN_OPTION_ICONS[alignType]}
      </Button>
    </ToolTip>
  );
}

function AlignOptions({ className }: AlignOptionsProps): JSX.Element {
  const selectedIds = useStore((state) => state.selectedIds);
  const inactive = selectedIds.length < 2;

  return (
    <div className={className}>
      <Row>
        <AlignOption alignType="left" inactive={inactive} />
        <AlignOption alignType="center_x" inactive={inactive} />
        <AlignOption alignType="right" inactive={inactive} />
      </Row>
      <Row>
        <AlignOption alignType="top" inactive={inactive} />
        <AlignOption alignType="center_y" inactive={inactive} />
        <AlignOption alignType="bottom" inactive={inactive} />
      </Row>
    </div>
  );
}

export default styled(AlignOptions, {
  display: 'flex',
  flexDirection: 'column',
  right: 10,
  top: 10,
  position: 'absolute',
  border: '1px solid $border',
  backgroundColor: '$background',
  padding: 6,
  borderRadius: 6,
  zIndex: 10,
});
