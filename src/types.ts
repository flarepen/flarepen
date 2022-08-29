import React from 'react';

export interface IMouseMove {
  accX: number;
  accY: number;
  currentEvent: null | React.MouseEvent;
  previousEvent: null | React.MouseEvent;
}
