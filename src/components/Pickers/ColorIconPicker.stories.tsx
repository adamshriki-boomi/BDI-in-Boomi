import { action } from '@storybook/addon-actions';
import React, { useCallback } from 'react';
import { ColorIconPicker } from './ColorIconPicker';

export default {
  title: 'Components/ColorIconPicker',
  component: ColorIconPicker,
} as any;
const Template = ({ selected }) => {
  const [selectedIcon, setSelectedIcon] = React.useState(selected.icon);
  const [selectedColor, setSelectedColor] = React.useState(selected.color);

  const onSelectColor = useCallback(color => {
    action('color')(color);
    setSelectedColor(color);
  }, []);

  const onSelectIcon = useCallback(icon => {
    action('icon')(icon);
    setSelectedIcon(icon);
  }, []);
  return (
    <ColorIconPicker
      selectedIcon={selectedIcon}
      selectedColor={selectedColor}
      onChangeIcon={onSelectIcon}
      onChangeColor={onSelectColor}
    />
  );
};
export const Default = Template.bind({});
const icon = 'tshirt';
const color = '#7d7094';

Default.args = {
  presets: null,
  selected: { icon: icon, color: color },
};
