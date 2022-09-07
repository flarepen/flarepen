import React, { useEffect, useRef } from 'react';
import { Y_SCALE } from '../../constants';
import { styled } from '../../stitches.config';

export interface TextInputProps {
  x: number;
  y: number;
  onInput: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
}

function TextInputRaw({ x, y, onInput, className }: TextInputProps): JSX.Element {
  const textRef = useRef<any>(null);

  useEffect(() => {
    textRef && textRef.current && textRef.current.focus();
  }, [textRef]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y - Y_SCALE}px`,
  };
  return (
    <div
      style={style}
      contentEditable="true"
      onInput={onInput}
      ref={textRef}
      className={className}
    ></div>
  );
}

export const TextInput = styled(TextInputRaw, {
  fontFamily: 'Cascadia',
  fontSize: '22px',
  color: '$secondary',
});
