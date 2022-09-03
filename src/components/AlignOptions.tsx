import { mauve } from '@radix-ui/colors';
import { styled } from '@stitches/react';
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
  return (
    <div className={className}>
      <Row>
        <Button onClick={() => {}}>
          <AlignLeftIcon />
        </Button>
        <Button onClick={() => {}}>
          <AlignCenterXIcon />
        </Button>
        <Button onClick={() => {}}>
          <AlignRightIcon />
        </Button>
      </Row>
      <Row>
        <Button onClick={() => {}}>
          <AlignTop />
        </Button>
        <Button onClick={() => {}}>
          <AlignCenterYIcon />
        </Button>
        <Button onClick={() => {}}>
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
  border: `1px solid ${mauve.mauve9}`,
  padding: 6,
  borderRadius: 6,
});
