import { GridBox } from 'components';
import React from 'react';
import Dot from '../Dot/Dot';
import DotButton from '../Dot/DotButton';

export type ColorPickerProps = {
  color?: string;
  presets?: string[];
  selected?: string;
  onChange?: (color: string) => any;
};
const defaultPreset = [
  '#7d7094',
  '#b3b9ff',
  '#f1c7e9',
  '#ffc493',
  '#ffd300',
  '#76eb84',
  '#33c7bd',
  '#26114d',
  '#5864e7',
  '#de7bc9',
  '#ed9750',
  '#ccaa05',
  '#51ce60',
  '#01837b',
];
ColorPicker.defaultPreset = defaultPreset;
export function ColorPicker({
  presets = defaultPreset,
  selected,
  onChange,
}: ColorPickerProps) {
  return (
    <div>
      <h6 aria-label={`color ${selected}`}>Color</h6>
      <GridBox gridTemplateColumns="repeat(7, minmax(0, 1fr))" mt={3}>
        {presets.map(color => (
          <DotButton
            color={color}
            checked={color === selected}
            onClick={() => onChange(color)}
            key={color}
            size={Dot.size.Small}
          />
        ))}
      </GridBox>
    </div>
  );
}
