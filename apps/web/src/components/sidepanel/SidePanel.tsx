import { useStore } from '../../state';
import { styled } from '../../stitches.config';
import AlignOptions from './AlignOptions';
import ElementOptions from './ElementOptions';

interface SidePanelProps {
  className?: string;
}

const SectionTitle = styled('div', {
  display: 'flex',
  alignContent: 'center',
  justifyContent: 'center',
  fontSize: 15,
  fontWeight: '500',
  fontFamily: 'Cascadia',
  color: '$primaryText',
  userSelect: 'none',
});

function RawSidePanel({ className }: SidePanelProps): JSX.Element {
  const selectedIds = useStore((state) => state.selectedIds);
  const selectedGroupIds = useStore((state) => state.selectedGroupIds);
  const showAlignOptions = selectedIds.length + selectedGroupIds.length >= 2;
  const showElementOptions = selectedIds.length === 1 && selectedGroupIds.length === 0;

  return (
    <div className={className}>
      {showAlignOptions && (
        <>
          <SectionTitle>Align</SectionTitle>
          <AlignOptions />
        </>
      )}
      {showElementOptions && (
        <>
          <ElementOptions elementId={selectedIds[0]} />
        </>
      )}
    </div>
  );
}

export const SidePanel = styled(RawSidePanel, {
  display: 'flex',
  flexDirection: 'column',
  right: 12,
  top: 48,
  color: '$primaryText',
  position: 'absolute',
  border: '1px solid $border',
  backgroundColor: '$background',
  padding: 6,
  borderRadius: 6,
  zIndex: 10,
});
