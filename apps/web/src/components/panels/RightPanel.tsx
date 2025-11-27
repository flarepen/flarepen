import React from 'react';
import { useStore } from '../../state';
import { Panel, PanelContent, PanelSection, SectionTitle, PanelDivider } from './Panel';
import AlignOptions from './AlignOptions';
import ElementOptions from './ElementOptions';
import { handlerFor } from '../../element';

export function RightPanel() {
  const selectedIds = useStore((state) => state.selectedIds);
  const selectedGroupIds = useStore((state) => state.selectedGroupIds);
  const elements = useStore((state) => state.elements);

  const canAlign = selectedIds.length + selectedGroupIds.length >= 2;
  const showElementOptions =
    selectedIds.length === 1 &&
    selectedGroupIds.length === 0 &&
    elements[selectedIds[0]]?.labelEnabled;

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  const elementTypeName = selectedElement ? handlerFor(selectedElement).getName() : 'Element';

  return (
    <Panel>
      <PanelContent>
        <PanelSection>
          <SectionTitle>Alignment</SectionTitle>
          <AlignOptions disabled={!canAlign} />
        </PanelSection>

        <PanelDivider />

        {showElementOptions ? (
          <PanelSection>
            <SectionTitle>{elementTypeName}</SectionTitle>
            <ElementOptions elementId={selectedIds[0]} />
          </PanelSection>
        ) : (
          <div
            style={{
              padding: '16px',
              textAlign: 'center',
              opacity: 0.5,
              fontSize: '12px',
            }}
          >
            Select an element to view properties
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}
