import { mauve, mauveDark, tomato } from '@radix-ui/colors';
import { useStore } from '@/state';
import { Theme } from '@/types';

export function useCanvasColors() {
  const theme = useStore((state) => state.theme);

  if (theme === Theme.light) {
    return {
      text: mauve.mauve12,
      selection: tomato.tomato10,
      selectionBackground: tomato.tomato10,
      cellHighlight: tomato.tomato10,
    };
  } else {
    return {
      text: mauveDark.mauve12,
      selection: tomato.tomato10,
      selectionBackground: tomato.tomato10,
      cellHighlight: tomato.tomato10,
    };
  }
}
