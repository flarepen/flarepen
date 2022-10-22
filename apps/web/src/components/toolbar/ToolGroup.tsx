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
      <ToggleItem selected={selected} item={Tool.Rectangle} toolTip={'Rectangle'}>
        <SquareIcon />
      </ToggleItem>
      <ToggleItem selected={selected} item={Tool.Line} toolTip={'Line'}>
        <LineIcon />
      </ToggleItem>
      <ToggleItem selected={selected} item={Tool.Arrow} toolTip={'Arrow'}>
        <ArrowIcon />
      </ToggleItem>
      <ToggleItem selected={selected} item={Tool.Text} toolTip={'Text'}>
        <TextIcon />
      </ToggleItem>
      <ToggleItem selected={selected} item={Tool.Select} toolTip={'Select'}>
        <SelectIcon />
      </ToggleItem>
    </>
  );
}

export default ToolGroup;
