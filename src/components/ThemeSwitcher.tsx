import { useStore, actions } from '../state';
import { Theme } from '../types';
import Button from './Button';
import { MoonIcon, SunIcon } from './icons';

export function ThemeSwitcher(): JSX.Element {
  const theme = useStore((state) => state.theme);

  const icon = theme === Theme.dark ? <SunIcon /> : <MoonIcon />;
  return (
    <Button
      onClick={() => {
        theme === Theme.dark ? actions.setTheme(Theme.light) : actions.setTheme(Theme.dark);
      }}
    >
      {icon}
    </Button>
  );
}
