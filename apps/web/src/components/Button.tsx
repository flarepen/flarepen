import { styled } from '../stitches.config';

export const buttonStyles = {
  all: 'unset',
  minWidth: 26,
  minHeight: 26,
  padding: '4px',
  borderRadius: 4,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  margin: '0 2px',
  cursor: 'pointer',
  color: '$actionText',

  '&:hover': {
    backgroundColor: '$actionBgHover',
  },
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
