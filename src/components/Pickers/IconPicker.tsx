import { Box, GridBox } from 'components';
import React from 'react';
import Dot from '../Dot/Dot';
import DotButton from '../Dot/DotButton';

export type IconPickerProps = {
  icon?: string;
  color?: string;
  presets?: string[];
  selected?: string;
  onChange?: (icon: string) => any;
  className?: string;
  header?: string;
};
export const defaultPreset = [
  'tshirt',
  'ballons',
  'bug',
  'camera',
  'candy_cane',
  'candy',
  'coffee',
  'crown',
  'flower',
  'friendly',
  'island',
  'juice',
  'leaf',
  'mashrom',
  'smily',
  'spray',
  'sprout',
  'star',
];
export function IconPicker({
  presets = defaultPreset,
  selected,
  onChange,
  color,
  className,
  header = 'Icon',
}: IconPickerProps) {
  return (
    <Box my={5}>
      <h6 aria-label={`icon ${color} ${selected}`}>{header}</h6>
      <GridBox gridTemplateColumns="repeat(6, minmax(0, 1fr))" mt={3}>
        {presets.map(icon => (
          <DotButton
            color={color}
            checked={icon === selected}
            onClick={() => onChange(icon)}
            key={icon}
            size={Dot.size.Medium}
            icon={icon}
          />
        ))}
      </GridBox>
    </Box>
  );
}
