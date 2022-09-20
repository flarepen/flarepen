import './App.css';
import { useStore, actions } from './state';
import _ from 'lodash';
import UndoRedo from './components/UndoRedo';
import { ToolBar, ToolGroup, Separator, ActionGroup } from './components/toolbar';
import React from 'react';
import Editor from './components/editor';
import { styled, theme, darkTheme } from './stitches.config';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Theme } from './types';
import AlignOptions from './components/AlignOptions';
import { TooltipProvider } from '@radix-ui/react-tooltip';

const ToolBarWrapper = styled('div', {
  left: 10,
  top: 10,
  float: 'left',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
});

function App() {
  const selected = useStore((state) => state.tool);

  const past = useStore((state) => state.past);
  const future = useStore((state) => state.future);

  const selectedTheme = useStore((state) => state.theme);

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
        <ToolBarWrapper>
          <ToolBar>
            <ToolGroup selected={selected} />
            <Separator />
            <ActionGroup />
          </ToolBar>
          <ThemeSwitcher />
        </ToolBarWrapper>
        <UndoRedo />
        <AlignOptions />
        <Editor />
      </TooltipProvider>
    </div>
  );
}

export default App;
