import { ElementType } from '../../element';
import { actions, useStore } from '../../state';
import { styled } from '../../stitches.config';
import { BorderType } from '../../types';
import * as g from './../../geometry';

const StyledInput = styled('input', {
  all: 'unset',
  fontFamily: 'Cascadia',
  fontSize: 12,
  color: '$actionText',
  border: '1px solid $panelBorder',
  backgroundColor: '$panelBg',
  padding: 6,
  borderRadius: 2,
  flex: 1,
  minWidth: 0,
  boxSizing: 'border-box',
  '&:focus': {
    border: `1px solid $panelBorder`,
  },
});

const StyledSelect = styled('select', {
  fontSize: 12,
  fontFamily: 'Cascadia',
  color: '$actionText',
  border: '1px solid $panelBorder',
  backgroundColor: '$panelBg',
  padding: 6,
  borderRadius: 2,
  flex: 1,
  minWidth: 0,
  boxSizing: 'border-box',
  '&:focus': {
    border: `1px solid $panelBorder`,
  },
});

const OptionName = styled('span', {
  fontSize: 11,
  fontWeight: '500',
  fontFamily: 'Cascadia',
  color: '$actionText',
  userSelect: 'none',
  opacity: 0.7,
  marginRight: 8,
  flexShrink: 0,
});

const Option = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
  gap: 4,
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
        element.shape = g.rectangle(element);
      }
    });
  };

  const updateBorder = (event: React.ChangeEvent<HTMLSelectElement>) => {
    actions.updateElement(selectedElement.id, (element) => {
      const newValue = event.target.value;
      if (element.type === ElementType.Rectangle) {
        element.borderType = newValue as BorderType;
        element.shape = g.rectangle(element);
      }
    });
  };

  return (
    <div className={className}>
      <Option>
        <OptionName>Label</OptionName>
        <StyledInput value={selectedElement.label || ''} onChange={updateLabel} />
      </Option>
      {selectedElement.type === ElementType.Rectangle && (
        <Option>
          <OptionName>Type</OptionName>
          <StyledSelect value={selectedElement.borderType} onChange={updateBorder}>
            <option value={BorderType.Normal}>Normal</option>
            <option value={BorderType.Double}>Double</option>
            <option value={BorderType.Heavy}>Heavy</option>
            <option value={BorderType.Rounded}>Rounded</option>
          </StyledSelect>
        </Option>
      )}
    </div>
  );
}

export default styled(ElementOptions, {});
