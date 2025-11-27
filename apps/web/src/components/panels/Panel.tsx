import { styled } from '../../stitches.config';

export const Panel = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '$panelBg',
  color: '$actionText',
});

export const PanelHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$panelPadding',
  backgroundColor: '$panelHeaderBg',
  borderBottom: '1px solid $panelBorder',
  minHeight: '40px',
});

export const PanelTitle = styled('h2', {
  fontSize: 12,
  fontWeight: 600,
  fontFamily: 'Cascadia',
  margin: 0,
  userSelect: 'none',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

export const PanelContent = styled('div', {
  flex: 1,
  overflow: 'auto',
  padding: '$panelPadding',
});

export const PanelSection = styled('div', {
  marginBottom: '$sectionGap',
});

export const SectionTitle = styled('div', {
  fontSize: 12,
  fontWeight: 500,
  fontFamily: 'Cascadia',
  color: '$actionText',
  userSelect: 'none',
  marginBottom: '8px',
});

export const PanelDivider = styled('div', {
  height: '1px',
  backgroundColor: '$panelBorder',
  margin: '12px 0',
});
