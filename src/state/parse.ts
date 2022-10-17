import { Element, ElementType, Rectangle, Line, Arrow, Text, isHorizontalLine } from '../element';
import * as g from '../geometry';

export class ElementParseError extends Error {
  constructor(msg: string) {
    super(msg);

    Object.setPrototypeOf(this, ElementParseError.prototype);
  }
}

export function parse(obj: any): Element {
  const type = get(obj, 'type');
  switch (type) {
    case ElementType.Rectangle:
      return parseRectangle(obj);
    case ElementType.Line:
      return parseLine(obj);
    case ElementType.Arrow:
      return parseArrow(obj);
    case ElementType.Text:
      return parseText(obj);
  }
  throw new ElementParseError('Unkown type');
}

function parseRectangle(obj: any): Rectangle {
  let elem: Rectangle = {
    id: get(obj, 'id'),
    x: get(obj, 'x'),
    y: get(obj, 'y'),
    width: get(obj, 'width'),
    height: get(obj, 'height'),
    label: optional(obj, 'label'),
    shape: [],
    type: ElementType.Rectangle,
    labelEnabled: true,
  };

  elem.shape = g.rectangle(elem.width, elem.height);

  return elem;
}

function parseLine(obj: any): Line {
  let elem: Line = {
    id: get(obj, 'id'),
    x: get(obj, 'x'),
    y: get(obj, 'y'),
    len: get(obj, 'len'),
    direction: get(obj, 'direction'),
    shape: [],
    type: ElementType.Line,
    labelEnabled: false,
  };

  elem.shape = g.line(elem.len, isHorizontalLine(elem));

  return elem;
}

function parseArrow(obj: any): Arrow {
  let elem: Arrow = {
    id: get(obj, 'id'),
    x: get(obj, 'x'),
    y: get(obj, 'y'),
    len: get(obj, 'len'),
    direction: get(obj, 'direction'),
    shape: [],
    type: ElementType.Arrow,
    labelEnabled: false,
  };

  elem.shape = g.arrow(elem.len, elem.direction);

  return elem;
}

function parseText(obj: any): Text {
  let elem: Text = {
    id: get(obj, 'id'),
    x: get(obj, 'x'),
    y: get(obj, 'y'),
    content: optional(obj, 'content'),
    shape: [],
    type: ElementType.Text,
    labelEnabled: false,
  };

  elem.shape = g.text(elem.content);

  return elem;
}

function get(obj: any, name: string): any {
  if (obj[name]) {
    return obj[name];
  }

  throw new ElementParseError(`Missing field ${name}`);
}

function optional(obj: any, name: string): any {
  return obj[name];
}
