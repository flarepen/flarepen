import { mauve, orange } from '@radix-ui/colors';
import { styled } from '@stitches/react';

const Button = styled('button', {
  all: 'unset',
  height: 25,
  padding: '0 5px',
  borderRadius: 4,
  display: 'inline-flex',
  color: mauve.mauve11,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  marginLeft: 2,
  cursor: 'pointer',
  '&:first-child': { marginLeft: 0 },
  '&:hover': { backgroundColor: orange.orange2 },
  '&:active': { backgroundColor: orange.orange3, color: orange.orange10 },
  '&:focus': { backgroundColor: orange.orange2 },
  variants: {
    inactive: {
      true: {
        color: mauve.mauve8,
        '&:hover': { backgroundColor: 'white', cursor: 'not-allowed' },
        '&:active': { backgroundColor: 'white', color: mauve.mauve8 },
      },
    },
  },
});

export default Button;
