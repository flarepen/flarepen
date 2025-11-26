import { Element, ElementHandler, ElementData } from './types';
import { LineHandler } from './handlers/line';
import { ArrowHandler } from './handlers/arrow';
import { RectangleHandler } from './handlers/rectangle';
import { TextHandler } from './handlers/text';

class ElementHandlerRegistry {
  private handlers = new Map<string, ElementHandler<any>>();

  register(handler: ElementHandler<any>) {
    this.handlers.set(handler.type, handler);
  }

  get(type: string): ElementHandler<any> {
    const h = this.handlers.get(type);
    if (!h) throw new Error(`No handler for: ${type}`);
    return h;
  }
}

export const registry = new ElementHandlerRegistry();

registry.register(RectangleHandler);
registry.register(LineHandler);
registry.register(ArrowHandler);
registry.register(TextHandler);

export function elementHandlerFor<T extends ElementData>(
  element: Element & { data: T }
): ElementHandler<T> {
  return registry.get(element.data.type) as ElementHandler<T>;
}
