import { ElementType } from '../../element';
import { actions, useStore } from '../../state';
import { styled } from '../../stitches.config';
import * as g from './../../geometry';

const StyledInput = styled('input', {
  all: 'unset',
  fontFamily: 'Cascadia',
  color: '$primaryText',
  border: '1px solid $border',
  backgroundColor: '$background',
  marginTop: 10,
  marginLeft: 4,
  marginRight: 4,
  padding: 6,
  borderRadius: 6,
  zIndex: 10,
  '&:focus': {
    border: `1px solid $primary`,
  },
});

const OptionName = styled('div', {
  fontSize: 15,
  fontWeight: '500',
  fontFamily: 'Cascadia',
  color: '$primaryText',
  userSelect: 'none',
});

interface ElementOptionsProps {
  className?: string;
  elementId: string;
}

function ElementOptions({ className, elementId }: ElementOptionsProps): JSX.Element {
  const elements = useStore((state) => state.elements);
  const selectedElement = elements[elementId];

  const updateLabel = (event: React.ChangeEvent<HTMLInputElement>) => {
    actions.updateElement(selectedElement.id, (element) => {
      const newValue = event.target.value;
      if (element.type === ElementType.Rectangle) {
        if (element.width < newValue.length + 2) {
          element.width = newValue.length + 2;
        }
        element.label = newValue;
        element.shape = g.rectangle(element.width, element.height, newValue);
      }
    });
  };

  return (
    <div className={className}>
      <OptionName>Label</OptionName>
      <StyledInput value={selectedElement.label || ''} onChange={updateLabel} />
    </div>
  );
}

export default styled(ElementOptions, {});
