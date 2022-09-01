import * as ToolbarPrimitive from '@radix-ui/react-toolbar';

import { Tool } from './../../tools';
import ToggleItem from './ToggleItem';
import { ArrowIcon, LineIcon, SelectIcon, SquareIcon, TextIcon } from '../icons';

interface ToggleGroupProps {
  value: Tool;
  onValueChange: (tool: Tool) => void;
}

function ToggleGroup({ value, onValueChange }: ToggleGroupProps): JSX.Element {
  return (
    <ToolbarPrimitive.ToggleGroup type="single" value={value} onValueChange={onValueChange}>
      <ToggleItem tool={Tool.Rectangle} icon={<SquareIcon />} />
      <ToggleItem tool={Tool.Line} icon={<LineIcon />} />
      <ToggleItem tool={Tool.Arrow} icon={<ArrowIcon />} />
      <ToggleItem tool={Tool.Text} icon={<TextIcon />} />
      <ToggleItem tool={Tool.Select} icon={<SelectIcon />} />
    </ToolbarPrimitive.ToggleGroup>
  );
}

export default ToggleGroup;
