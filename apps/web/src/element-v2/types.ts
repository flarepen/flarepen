import { RenderedShape, GridCell, GridBounds, rendered } from '../geometry-v2/types';
import { PixelPoint, PixelBounds } from '../scale';
import { BorderType, EditInput, EditHandle } from '../types';

export interface Element {
  id: string;
  position: GridCell;
  shape: RenderedShape;
  data: ElementData;
}

export type ElementData = 
  | RectangleData 
  | LineData 
  | ArrowData 
  | TextData;

export interface RectangleData {
  type: 'rectangle';
  width: number;
  height: number;
  borderType: BorderType;
  label?: string;
}

export interface LineData {
  type: 'line';
  vertices: GridCell[];
}

export interface ArrowData {
  type: 'arrow';
  vertices: GridCell[];
  startArrow: boolean;
  endArrow: boolean;
}

export interface TextData {
  type: 'text';
  content: string;
}

export type RectangleElement = Element & { data: RectangleData };
export type LineElement = Element & { data: LineData };
export type ArrowElement = Element & { data: ArrowData };
export type TextElement = Element & { data: TextData };

export interface ElementHandler<T extends ElementData> {
  type: string;
  create(position: GridCell): Element & { data: T };
  bounds(element: Element & { data: T }): GridBounds;
  selectionBounds(element: Element & { data: T }): PixelBounds;
  inVicinity(element: Element & { data: T }, point: PixelPoint): boolean;
  editHandles(element: Element & { data: T }): EditHandle[];
  applyEdit(element: Element & { data: T }, handleId: string | null, input: EditInput): Element & { data: T };
  guideAnchors(element: Element & { data: T }): PixelPoint[];
}
