import { mauve, orange } from '@radix-ui/colors';
import { useStore } from '../../../state';
import { Theme } from '../../../types';

export function useCanvasColors() {
  const theme = useStore((state) => state.theme);

  if (theme === Theme.light) {
    return {
      text: mauve.mauve12,
      selection: orange.orange10,
      selectionBackground: orange.orange10,
    };
  } else {
    return {
      text: mauve.mauve8,
      selection: orange.orange11,
      selectionBackground: orange.orange11,
    };
  }
}
