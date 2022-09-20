import { mauve, orange } from '@radix-ui/colors';
import { createStitches } from '@stitches/react';

export const { styled, css, theme, createTheme } = createStitches({
  theme: {
    colors: {
      primary: orange.orange10,
      primaryBackground: orange.orange3,
      primaryBackgroundDim: orange.orange2,
      secondary: mauve.mauve11,
      secondaryBackground: mauve.mauve8,
      border: mauve.mauve9,
      background: 'white',
      canvasBackground: 'white',
      gridColor: mauve.mauve12,
      toolTipBackground: '#212529',
    },
  },
});

export const darkTheme = createTheme({
  colors: {
    primary: mauve.mauve1,
    primaryBackground: orange.orange10,
    primaryBackgroundDim: orange.orange11,
    secondary: mauve.mauve5,
    secondaryBackground: mauve.mauve9,
    border: mauve.mauve9,
    background: '#212529',
    canvasBackground: '#212529',
    gridColor: mauve.mauve9,
    toolTipBackground: mauve.mauve11,
  },
});
