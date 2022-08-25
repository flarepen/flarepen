import './App.css';
import { useState } from "react";
import Canvas from './Canvas';

export enum Tool {
    Rectangle = "Rectangle",
    Line = "Line",
    Arrow = "Arrow",
}

interface ToolProps {
    tool: Tool,
    selected: Tool,
    onClick: Function
}

function ToolInput({tool, selected, onClick}: ToolProps) {
    return (
        <>
            <input id={tool} type="radio" checked={selected === tool} onChange={() => onClick(tool)}></input>
            <label htmlFor={tool}>{tool}</label>
        </>
    );
}

function App() {
    const [selected, setSelected] = useState<Tool>(Tool.Rectangle);
    return (
        <div className="App">
            <fieldset style={{float: "left", position: "absolute"}}>
                <legend>Select Tool</legend>
                <ToolInput tool={Tool.Rectangle} selected={selected} onClick={setSelected}/>
                <ToolInput tool={Tool.Line} selected={selected} onClick={setSelected}/>
                <ToolInput tool={Tool.Arrow} selected={selected} onClick={setSelected}/>
            </fieldset>
            <Canvas tool={selected}></Canvas>
        </div>
    );
}

export default App;
