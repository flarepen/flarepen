import { styled } from '../../stitches.config';

interface GridProps {
  className?: string;
}

function Grid({ className }: GridProps): JSX.Element {
  return (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="13" height="30" patternUnits="userSpaceOnUse">
          <path d="M 13 0 L 0 0 0 30" fill="none" stroke="black" strokeWidth="0.5" />
          {/* <circle id="pattern-circle" cx="10" cy="10" r="1" fill="#000"></circle> */}
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
});
