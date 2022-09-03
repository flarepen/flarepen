import './App.css';
import { useStore } from './state';
import _ from 'lodash';
import UndoRedo from './components/UndoRedo';
import { ToolBar, ToggleGroup, Separator, ActionGroup } from './components/toolbar';
import React from 'react';
import Editor from './components/editor';
import AlignOptions from './components/AlignOptions';

function App() {
  const selected = useStore((state) => state.tool);
  const setTool = useStore((state) => state.setTool);

  const past = useStore((state) => state.past);
  const future = useStore((state) => state.future);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);

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

  return (
    <div className="App" onKeyDown={handleKeyPress}>
      <ToolBar>
        <ToggleGroup value={selected} onValueChange={setTool} />
        <Separator />
        <ActionGroup />
      </ToolBar>
      <UndoRedo />
      <AlignOptions />
      <Editor />
    </div>
  );
}

export default App;
