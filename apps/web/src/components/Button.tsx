import { styled } from '../stitches.config';

export const buttonStyles = {
  all: 'unset',
  height: 25,
  padding: '0 5px',
  borderRadius: 4,
  display: 'inline-flex',
  color: '$actionText',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$actionBg',
  marginLeft: 2,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '$actionBgHover' },
  '&:active': {
    backgroundColor: '$actionBgActive',
    color: '$actionTextActive',
  },
  variants: {
    inactive: {
      true: {
        color: '$actionTextDisabled',
        '&:hover': { backgroundColor: '$actionBg', cursor: 'not-allowed' },
        '&:active': { backgroundColor: '$actionBg', color: '$actionText' },
      },
    },
    toggled: {
      true: {
        backgroundColor: '$actionBgActive',
        color: '$actionTextActive',
      },
    },
  },
};

const Button = styled('button', buttonStyles);

export default Button;
