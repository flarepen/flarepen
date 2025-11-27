import './App.css';
import { useStore, actions } from './state';
import _ from 'lodash';
import UndoRedo from './components/UndoRedo';
import { ToolBar, ToolGroup, ActionGroup, ExportImportButtons } from './components/toolbar';
import React, { useEffect } from 'react';
import Editor from './editor';
import { styled, theme, darkTheme } from './stitches.config';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Theme } from './types';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { GridSwitcher } from './components/GridSwitcher';
import { ToolLock } from './components/ToolLock';
import { RightPanel, LeftPanel } from './components/panels';
import { LeftPanelToggle } from './components/LeftPanelToggle';
import { RightPanelToggle } from './components/RightPanelToggle';

import init, { render } from 'text-render';

const ToolbarContainer = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '$toolbarBg',
  borderBottom: '1px solid $toolbarBorder',
  padding: '0 16px 0 8px',
  minHeight: '40px',
  flexShrink: 0,
  gap: '16px',
});

const ToolbarSection = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 0, // Prevent sections from shrinking
});

const AppTitle = styled('h1', {
  fontSize: 14,
  fontWeight: 500,
  fontFamily: 'Cascadia',
  color: '$actionText',
  margin: 0,
  userSelect: 'none',
});

const Divider = styled('div', {
  width: 1,
  height: '20px',
  backgroundColor: '$actionText',
  opacity: 0.2,
});

const AppGrid = styled('div', {
  display: 'grid',
  height: '100vh',
  width: '100vw',
  gridTemplateRows: 'auto 1fr',
  gridTemplateColumns: 'auto 1fr auto',
  gridTemplateAreas: `
    "toolbar toolbar toolbar"
    "left-panel canvas right-panel"
  `,
});

const CanvasArea = styled('div', {
  gridArea: 'canvas',
  position: 'relative',
  overflow: 'hidden',
});

const LeftPanelArea = styled('div', {
  gridArea: 'left-panel',
  borderRight: '1px solid $panelBorder',
  backgroundColor: '$panelBg',
  overflow: 'hidden',
});

const RightPanelArea = styled('div', {
  gridArea: 'right-panel',
  borderLeft: '1px solid $panelBorder',
  backgroundColor: '$panelBg',
  overflow: 'hidden',
});

const EditorContainer = styled('div', {
  position: 'relative',
  flex: 1,
  overflow: 'hidden',
});

function App() {
  useEffect(() => {
    init().then(() => {
      console.log(render());
    });
  }, []);
  const selected = useStore((state) => state.tool);

  const past = useStore((state) => state.past);
  const future = useStore((state) => state.future);

  const selectedTheme = useStore((state) => state.theme);

  const selectedIds = useStore((state) => state.selectedIds);
  const selectedGroupIds = useStore((state) => state.selectedGroupIds);

  const canRedo = future.length > 0;
  const canUndo = past.length > 0;

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.ctrlKey) {
      if ((e.key === 'z' || e.key === 'Z') && canUndo) {
        actions.undo();
      }
      if ((e.key === 'y' || e.key === 'Y') && canRedo) {
        actions.redo();
      }
    }
  }

  const rightPanelOpen = useStore((state) => state.rightPanel.isOpen);
  const leftPanelOpen = useStore((state) => state.leftPanel.isOpen);

  const themeClass = selectedTheme === Theme.light ? theme : darkTheme;

  const leftColWidth = leftPanelOpen ? '200px' : '0px';
  const rightColWidth = rightPanelOpen ? '300px' : '0px';

  return (
    <div className={`App ${themeClass}`} onKeyDown={handleKeyPress}>
      <TooltipProvider>
        <AppGrid
          style={{
            gridTemplateColumns: `${leftColWidth} 1fr ${rightColWidth}`,
          }}
        >
          <ToolbarContainer style={{ gridArea: 'toolbar' }}>
            {/* Left section - Menu and File */}
            <ToolbarSection>
              <LeftPanelToggle />
              <Divider />
              <ToolBar>
                <ExportImportButtons />
              </ToolBar>
            </ToolbarSection>

            {/* Center section - Tools and Actions */}
            <ToolbarSection style={{ flex: 1, justifyContent: 'center' }}>
              <ToolLock />
              <Divider />
              <ToolBar>
                <ToolGroup selected={selected} />
              </ToolBar>
              <Divider />
              <ToolBar>
                <ActionGroup />
              </ToolBar>
            </ToolbarSection>

            {/* Right section - History and View */}
            <ToolbarSection>
              <UndoRedo />
              <Divider />
              <GridSwitcher />
              <ThemeSwitcher />
              <RightPanelToggle />
            </ToolbarSection>
          </ToolbarContainer>

          {leftPanelOpen && (
            <LeftPanelArea>
              <LeftPanel />
            </LeftPanelArea>
          )}

          <CanvasArea>
            <Editor />
          </CanvasArea>

          {rightPanelOpen && (
            <RightPanelArea>
              <RightPanel />
            </RightPanelArea>
          )}
        </AppGrid>
      </TooltipProvider>
    </div>
  );
}

export default App;
