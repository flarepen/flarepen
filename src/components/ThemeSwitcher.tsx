import { useStore } from '../state';
import { Theme } from '../types';
import Button from './Button';
import { MoonIcon, SunIcon } from './icons';

export function ThemeSwitcher(): JSX.Element {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  const icon = theme === Theme.dark ? <SunIcon /> : <MoonIcon />;
  return (
    <Button
      onClick={() => {
        theme === Theme.dark ? setTheme(Theme.light) : setTheme(Theme.dark);
      }}
    >
      {icon}
    </Button>
  );
}
