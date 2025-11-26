import './App.css';
import { useStore, actions } from './state';
import _ from 'lodash';
import UndoRedo from './components/UndoRedo';
import { ToolBar, ToolGroup, ActionGroup } from './components/toolbar';
import React, { useEffect } from 'react';
import Editor from './editor';
import { styled, theme, darkTheme } from './stitches.config';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Theme } from './types';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { GridSwitcher } from './components/GridSwitcher';
import { SidePanel } from './components/sidepanel';
import { ToolLock } from './components/ToolLock';

import init, { render } from 'text-render';

const ToolbarContainer = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '$toolbarBg',
  borderBottom: '1px solid $toolbarBorder',
  padding: '0 16px',
  minHeight: '40px',
  flexShrink: 0, // Prevent toolbar from shrinking
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
  const elements = useStore((state) => state.elements);

  const showSidePanel =
    (selectedIds.length === 1 &&
      selectedGroupIds.length === 0 &&
      elements[selectedIds[0]].labelEnabled) ||
    selectedIds.length + selectedGroupIds.length >= 2;

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

  const themeClass = selectedTheme === Theme.light ? theme : darkTheme;

  return (
    <div className={`App ${themeClass}`} onKeyDown={handleKeyPress} style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <TooltipProvider>
        <ToolbarContainer>
          <ToolbarSection>
            <ToolLock />
            <Divider />
            <ToolBar>
              <ToolGroup selected={selected} />
            </ToolBar>
          </ToolbarSection>

          <ToolbarSection>
            <AppTitle>ASCII Drawing</AppTitle>
          </ToolbarSection>

          <ToolbarSection>
            <ToolBar>
              <ActionGroup />
            </ToolBar>
            <Divider />
            <UndoRedo />
            <Divider />
            <GridSwitcher />
            <ThemeSwitcher />
          </ToolbarSection>
        </ToolbarContainer>

        <EditorContainer>
          {showSidePanel && <SidePanel />}
          <Editor />
        </EditorContainer>
      </TooltipProvider>
    </div>
  );
}

export default App;
