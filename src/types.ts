import React from 'react';
import { X_SCALE, Y_SCALE } from './constants';
import { IBounds } from './element';

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

export enum Theme {
  dark = 'dark',
  light = 'light',
}

export type SelectionBoxStatus = 'inactive' | 'active' | 'pending';

export interface ISelectionBox {
  bounds: null | IBounds;
  status: SelectionBoxStatus;
}

export type EditHandleType =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

export interface EditHandle {
  handleType: EditHandleType;
  bounds: IBounds;
}

export interface EditingContext {
  id: null | string;
  handleType: null | EditHandleType;
}

export interface Point {
  x: number;
  y: number;
}

export interface MergedElements {
  origin: Point;
  content: string[][];
}

export enum ArrowKey {
  'Up' = 'ArrowUp',
  'Down' = 'ArrowDown',
  'Left' = 'ArrowLeft',
  'Right' = 'ArrowRight',
}

export type CanvasDrag = 'inactive' | 'active';

export interface ElementGroup {
  id: string;
  elementIds: string[];
}

export interface ElementToGroupMap {
  [elementId: string]: string;
}

export enum BorderType {
  Normal = 'normal',
  Double = 'double',
  Heavy = 'heavy',
}
