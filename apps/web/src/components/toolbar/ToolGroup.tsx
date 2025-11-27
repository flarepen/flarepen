import * as ToolbarPrimitive from '@radix-ui/react-toolbar';

import { Tool } from '../../tools';
import ToggleItem from './ToggleItem';
import { ArrowIcon, LineIcon, SelectIcon, SquareIcon, TextIcon } from '../icons';

interface ToolGroupProps {
  selected: Tool;
}

function ToolGroup({ selected }: ToolGroupProps): JSX.Element {
  return (
    <>
      <ToggleItem selected={selected} item={Tool.Rectangle} toolTip={'Rectangle (r)'} shortcut="r">
        <SquareIcon />
      </ToggleItem>
      <ToggleItem selected={selected} item={Tool.Line} toolTip={'Line (l)'} shortcut="l">
        <LineIcon />
      </ToggleItem>
      <ToggleItem selected={selected} item={Tool.Arrow} toolTip={'Arrow (a)'} shortcut="a">
        <ArrowIcon />
      </ToggleItem>
      <ToggleItem selected={selected} item={Tool.Text} toolTip={'Text (t)'} shortcut="t">
        <TextIcon />
      </ToggleItem>
      <ToggleItem selected={selected} item={Tool.Select} toolTip={'Select (s)'} shortcut="s">
        <SelectIcon />
      </ToggleItem>
    </>
  );
}

export default ToolGroup;
