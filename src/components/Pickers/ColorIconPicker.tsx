import { Box } from 'components';
import React from 'react';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';

export type ColorIconPickerProps = {
  color?: string;
  selectedIcon?: any;
  selectedColor?: any;
  onChangeColor?: any;
  onChangeIcon?: any;
};

export function ColorIconPicker({
  selectedIcon,
  selectedColor,
  onChangeColor,
  onChangeIcon,
}: ColorIconPickerProps) {
  return (
    <Box w="350px">
      <ColorPicker selected={selectedColor} onChange={onChangeColor} />
      <IconPicker
        color={selectedColor}
        selected={selectedIcon}
        onChange={onChangeIcon}
      />
    </Box>
  );
}
