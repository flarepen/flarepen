import { styled } from '../stitches.config';

const Button = styled('button', {
  all: 'unset',
  height: 25,
  padding: '0 5px',
  borderRadius: 4,
  display: 'inline-flex',
  color: '$secondary',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$background',
  marginLeft: 2,
  cursor: 'pointer',
  '&:first-child': { marginLeft: 0 },
  '&:hover': { backgroundColor: '$primaryBackgroundDim' },
  '&:active': { backgroundColor: '$primaryBackground', color: '$primary' },
  variants: {
    inactive: {
      true: {
        color: '$secondaryBackground',
        '&:hover': { backgroundColor: '$background', cursor: 'not-allowed' },
        '&:active': { backgroundColor: '$background', color: '$secondaryBackground' },
      },
    },
  },
});

export default Button;
