import React, { ChangeEvent, useEffect, useRef } from 'react';
import { Y_SCALE } from '../constants';

export interface TextInputProps {
  x: number;
  y: number;
  onInput: React.ChangeEventHandler<HTMLInputElement>;
}

export function TextInput({ x, y, onInput }: TextInputProps): JSX.Element {
  const textRef = useRef<any>(null);

  useEffect(() => {
    textRef && textRef.current && textRef.current.focus();
  }, [textRef]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y - Y_SCALE}px`,
    fontFamily: 'Cascadia',
    fontSize: '22px',
  };
  return <div style={style} contentEditable="true" onInput={onInput} ref={textRef}></div>;
}
