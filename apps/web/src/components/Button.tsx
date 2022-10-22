import { styled } from '../stitches.config';

export const buttonStyles = {
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
    toggled: {
      true: {
        backgroundColor: '$primaryBackground',
      },
    },
  },
};

const Button = styled('button', buttonStyles);

export default Button;