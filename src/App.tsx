import './App.css';
import { useStore } from './state';
import _ from 'lodash';
import UndoRedo from './components/UndoRedo';
import { ToolBar, ToggleGroup, Separator, ActionGroup } from './components/toolbar';
import React from 'react';
import Editor from './components/editor';
import { styled, theme, darkTheme } from './stitches.config';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Theme } from './types';
import AlignOptions from './components/AlignOptions';

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
  const setTool = useStore((state) => state.setTool);

  const past = useStore((state) => state.past);
  const future = useStore((state) => state.future);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);

  const selectedTheme = useStore((state) => state.theme);

  const canRedo = future.length > 0;
  const canUndo = past.length > 0;

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.ctrlKey) {
      if ((e.key === 'z' || e.key === 'Z') && canUndo) {
        undo();
      }
      if ((e.key === 'y' || e.key === 'Y') && canRedo) {
        redo();
      }
    }
  }

  const themeClass = selectedTheme === Theme.light ? theme : darkTheme;

  return (
    <div className={`App ${themeClass}`} onKeyDown={handleKeyPress}>
      <ToolBarWrapper>
        <ToolBar>
          <ToggleGroup value={selected} onValueChange={setTool} />
          <Separator />
          <ActionGroup />
        </ToolBar>
        <ThemeSwitcher />
      </ToolBarWrapper>
      <UndoRedo />
      <AlignOptions />
      <Editor />
    </div>
  );
}

export default App;
