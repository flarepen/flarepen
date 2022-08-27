import './App.css';
import { useState } from 'react';
import Canvas from './Canvas';
import { useStore } from './state';
import { scene } from './geometry';
import _ from 'lodash';

export enum Tool {
  Rectangle = 'Rectangle',
  Line = 'Line',
  Arrow = 'Arrow',
  Text = 'Text',
  Select = 'Select',
}

interface ToolProps {
  tool: Tool;
  selected: Tool;
  onClick: Function;
}

function ToolInput({ tool, selected, onClick }: ToolProps) {
  return (
    <>
      <input
        id={tool}
        type="radio"
        checked={selected === tool}
        onChange={() => onClick(tool)}
      ></input>
      <label htmlFor={tool}>{tool}</label>
    </>
  );
}

function App() {
  const [selected, setSelected] = useState<Tool>(Tool.Rectangle);

  const elements = useStore((state) => state.elements);
  const setElements = useStore((state) => state.setElements);

  const selectedElement = useStore((state) => state.selectedElement);
  const setSelectedElement = useStore((state) => state.setSelectedElement);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => console.log(text),
      () => console.log('copy failed')
    );
  }

  function handleDelete() {
    if (!selectedElement) {
      return null;
    }

    const index = _.findIndex(elements, (element) => element.id === selectedElement.id);
    if (index > -1) {
      elements.splice(index, 1);
      setElements(elements);
      setSelectedElement(null);
    }
  }

  return (
    <div className="App">
      <div style={{ float: 'left', position: 'absolute' }}>
        <fieldset style={{ display: 'inline' }}>
          <legend>Select Tool</legend>
          <ToolInput tool={Tool.Rectangle} selected={selected} onClick={setSelected} />
          <ToolInput tool={Tool.Line} selected={selected} onClick={setSelected} />
          <ToolInput tool={Tool.Arrow} selected={selected} onClick={setSelected} />
          <ToolInput tool={Tool.Select} selected={selected} onClick={setSelected} />
          <ToolInput tool={Tool.Text} selected={selected} onClick={setSelected} />
        </fieldset>
        <button style={{ display: 'inline' }} onClick={() => copyToClipboard(scene(elements))}>
          Copy
        </button>
        {selectedElement && (
          <button style={{ display: 'inline' }} onClick={() => handleDelete()}>
            Delete
          </button>
        )}
      </div>
      <Canvas tool={selected}></Canvas>
    </div>
  );
}

export default App;
