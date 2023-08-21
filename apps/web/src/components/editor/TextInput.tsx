import React, { useEffect, useRef } from 'react';
import { styled } from '../../stitches.config';
import { X_SCALE, Y_SCALE } from '../../constants';

export interface TextInputProps {
  x: number;
  y: number;
  value: string;
  onInput: React.ChangeEventHandler<HTMLTextAreaElement>;
  className?: string;
}

function TextInputRaw({ x, y, value, onInput, className }: TextInputProps): JSX.Element {
  const textRef = useRef<any>(null);

  useEffect(() => {
    setTimeout(() => {
      if (textRef && textRef.current) {
        textRef.current.focus();
        textRef.current.selectionStart = value.length;
      }
    }, 0);
  }, []);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    height: Y_SCALE,
    width: (value.length + 1) * X_SCALE,
    resize: 'none',
  };
  return (
    <textarea
      style={style}
      value={value}
      onChange={onInput} // TODO: Better handling with onBlur also?
      ref={textRef}
      className={className}
    ></textarea>
  );
}

export const TextInput = styled(TextInputRaw, {
  fontFamily: 'Cascadia',
  fontSize: '22px',
  color: '$actionText',
});
