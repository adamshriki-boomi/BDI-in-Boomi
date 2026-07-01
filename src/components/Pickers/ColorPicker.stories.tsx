import { action } from '@storybook/addon-actions';
import React, { useCallback } from 'react';
import { ColorPicker } from './ColorPicker';

export default {
  title: 'Components/ColorPicker',
  component: ColorPicker,
} as any;

const Template = ({ selected }) => {
  const [selectedColor, setSelectedColor] = React.useState(selected);
  const onSelect = useCallback(color => {
    action('color')(color);
    setSelectedColor(color);
  }, []);
  return <ColorPicker selected={selectedColor} onChange={onSelect} />;
};

export const Default = Template.bind({});

Default.args = {
  presets: null,
  selected: '#7d7094',
};
