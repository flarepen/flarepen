import { styled } from '../stitches.config';

interface GridProps {
  className?: string;
}

function Grid({ className }: GridProps): JSX.Element {
  return (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="13" height="30" patternUnits="userSpaceOnUse">
          <path d="m0 15 h100" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="m0 0 v100" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export const OverlayGrid = styled(Grid, {
  position: 'absolute',
  left: 0,
  top: 0,
  pointerEvents: 'none',
  opacity: '0.3',
  color: '$grid',
});
