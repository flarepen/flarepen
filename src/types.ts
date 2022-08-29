import React from 'react';
import { X_SCALE, Y_SCALE } from './constants';

export class IMouseMove {
  accX: number;
  accY: number;
  currentEvent: null | React.MouseEvent;
  previousEvent: null | React.MouseEvent;

  constructor() {
    this.accX = 0;
    this.accY = 0;
    this.currentEvent = null;
    this.previousEvent = null;
  }

  acc() {
    if (this.currentEvent) {
      this.accX +=
        this.currentEvent.clientX - (this.previousEvent ? this.previousEvent.clientX : 0);
      this.accY +=
        this.currentEvent.clientY - (this.previousEvent ? this.previousEvent.clientY : 0);
    }
  }

  flushAcc() {
    this.accX = this.accX % X_SCALE;
    this.accY = this.accY % Y_SCALE;
  }
}