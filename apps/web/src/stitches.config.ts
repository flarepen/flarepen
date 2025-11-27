import { mauve, mauveDark, tomato, tomatoDark } from '@radix-ui/colors';
import { createStitches } from '@stitches/react';

export const { styled, css, theme, createTheme } = createStitches({
  theme: {
    colors: {
      canvasBg: mauve.mauve2,
      toolbarBg: mauve.mauve4,
      toolbarBorder: mauve.mauve6,
      panelBg: mauve.mauve3,
      panelBorder: mauve.mauve6,
      panelHeaderBg: mauve.mauve4,
      panelItemHover: mauve.mauve5,
      panelItemSelected: tomato.tomato4,
      panelItemSelectedText: tomato.tomato11,
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
    space: {
      panelPadding: '12px',
      sectionGap: '8px',
    },
  },
});

export const darkTheme = createTheme({
  colors: {
    canvasBg: mauveDark.mauve2,
    toolbarBg: mauveDark.mauve4,
    toolbarBorder: mauveDark.mauve6,
    panelBg: mauveDark.mauve3,
    panelBorder: mauveDark.mauve6,
    panelHeaderBg: mauveDark.mauve4,
    panelItemHover: mauveDark.mauve5,
    panelItemSelected: tomatoDark.tomato4,
    panelItemSelectedText: tomatoDark.tomato11,
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
