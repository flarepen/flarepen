import React from 'react';
import { X_SCALE, Y_SCALE } from './constants';
import { Element, IBounds, Text } from './element';

/**
 * MouseMove - Accumulates mouse movement for grid-snapped operations
 *
 * Flow (Canvas.tsx on each pointer move):
 *   1. acc()                - Accumulate pixel delta into accX/accY
 *   2. mode.onPointerMove() - Mode reads accX/accY, calculates grid cells moved
 *   3. flushAcc()           - Remove consumed grid cells, keep sub-grid remainder
 *
 * Example (X_SCALE=10):
 *   accX = 3 (remainder from before)
 *   Mouse moves 20px → acc() → accX = 23
 *   Mode reads: Math.floor(23 / 10) = 2 grid cells → move element 20px
 *   flushAcc() → accX = 23 % 10 = 3 (removes consumed 20px, keeps 3px remainder)
 *
 * flushAcc() assumes modes consumed what they needed. It removes full grid cells
 * via modulo regardless of whether the mode actually used accX/accY.
 */
export class MouseMove {
  kind: 'mouse' = 'mouse';
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

  /**
   * Convert accumulated pixels to grid cells moved
   * Handles positive and negative movement correctly
   */
  getGridCellsMoved(): { cols: number; rows: number } {
    const cols = this.accX > 0 ? Math.floor(this.accX / X_SCALE) : Math.ceil(this.accX / X_SCALE);
    const rows = this.accY > 0 ? Math.floor(this.accY / Y_SCALE) : Math.ceil(this.accY / Y_SCALE);
    return { cols, rows };
  }
}

export interface KeyboardInput {
  kind: 'keyboard';
  content: string;
}

export type EditInput = MouseMove | KeyboardInput;

export enum Theme {
  dark = 'dark',
  light = 'light',
}

export interface EditHandle {
  handleId: string;
  bounds: IBounds;
}

export interface EditingContext {
  id: null | string;
  handleId: null | string;
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
  Rounded = 'rounded',
}

export type DraftStage = 'inactive' | 'active' | 'pending';

export interface Draft {
  element: Element;
  stage: DraftStage;
}

// New interaction mode state machine
export type InteractionMode =
  | { type: 'idle' }
  | { type: 'panning' }
  | { type: 'drawing'; element: Element; stage: 'pending' | 'active' }
  | { type: 'textEditing'; text: Text }
  | { type: 'dragging'; elementIds: string[] }
  | { type: 'selecting'; bounds: IBounds }
  | { type: 'editing'; elementId: string; handleId: string };
