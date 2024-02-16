import { mauve, mauveDark, tomato, tomatoDark } from '@radix-ui/colors';
import { createStitches } from '@stitches/react';

export const { styled, css, theme, createTheme } = createStitches({
  theme: {
    colors: {
      canvasBg: mauve.mauve2,
      panelBg: mauve.mauve3,
      panelBorder: mauve.mauve6,
      seperator: mauve.mauve6,
      actionBg: mauve.mauve3,
      actionBgHover: tomato.tomato4,
      actionBgActive: tomato.tomato5,
      actionText: mauve.mauve12,
      actionTextDisabled: mauve.mauve11,
      actionTextActive: tomato.tomato11,
      grid: mauveDark.mauve6,
      toolTipBg: mauve.mauve9,
      toolTipText: mauve.mauve1,
    },
  },
});

export const darkTheme = createTheme({
  colors: {
    canvasBg: mauveDark.mauve2,
    panelBg: mauveDark.mauve3,
    panelBorder: mauveDark.mauve6,
    seperator: mauveDark.mauve6,
    actionBg: mauveDark.mauve3,
    actionBgHover: tomatoDark.tomato4,
    actionBgActive: tomatoDark.tomato5,
    actionText: mauveDark.mauve12,
    actionTextDisabled: mauveDark.mauve11,
    actionTextActive: tomatoDark.tomato11,
    grid: mauve.mauve9,
    toolTipBg: mauveDark.mauve9,
    toolTipText: mauve.mauve1,
  },
});
