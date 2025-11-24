import './App.css';
import { useStore, actions } from './state';
import _ from 'lodash';
import UndoRedo from './components/UndoRedo';
import { ToolBar, ToolGroup, Separator, ActionGroup } from './components/toolbar';
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

const ToolBarWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
});

const ToolBarAlignContainer = styled('div', {
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  marginTop: 10,
});

const UndoRedoWrapper = styled('div', {
  left: 10,
  bottom: 10,
  float: 'left',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
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
    <div className={`App ${themeClass}`} onKeyDown={handleKeyPress}>
      <TooltipProvider>
        <ToolBarAlignContainer>
          <ToolBarWrapper>
            <ToolLock />
            <ToolBar>
              <ToolGroup selected={selected} />
              <Separator />
              <ActionGroup />
            </ToolBar>
            <ThemeSwitcher />
          </ToolBarWrapper>
        </ToolBarAlignContainer>
        <UndoRedoWrapper>
          <UndoRedo />
          <GridSwitcher />
        </UndoRedoWrapper>
        {showSidePanel && <SidePanel />}
        <Editor />
      </TooltipProvider>
    </div>
  );
}

export default App;
