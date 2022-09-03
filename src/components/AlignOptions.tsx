import { styled } from '@stitches/react';
import _ from 'lodash';
import { AlignType } from '../align-utils';
import { useStore } from '../state';
import Button from './Button';
import {
  AlignBottom,
  AlignCenterXIcon,
  AlignCenterYIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTop,
} from './icons';

interface AlignOptionsProps {
  className?: string;
}

const Row = styled('div', {
  display: 'flex',
});

function AlignOptions({ className }: AlignOptionsProps): JSX.Element {
  const selectedIds = useStore((state) => state.selectedIds);
  const alignElements = useStore((state) => state.alignElements);

  const inactive = selectedIds.length < 2;

  function getAlignHandler(alignType: AlignType) {
    return () => alignElements(alignType);
  }

  return (
    <div className={className}>
      <Row>
        <Button onClick={getAlignHandler('left')} inactive={inactive}>
          <AlignLeftIcon />
        </Button>
        <Button onClick={getAlignHandler('center_x')} inactive={inactive}>
          <AlignCenterXIcon />
        </Button>
        <Button onClick={getAlignHandler('right')} inactive={inactive}>
          <AlignRightIcon />
        </Button>
      </Row>
      <Row>
        <Button onClick={getAlignHandler('top')} inactive={inactive}>
          <AlignTop />
        </Button>
        <Button onClick={getAlignHandler('center_y')} inactive={inactive}>
          <AlignCenterYIcon />
        </Button>
        <Button onClick={getAlignHandler('bottom')} inactive={inactive}>
          <AlignBottom />
        </Button>
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
