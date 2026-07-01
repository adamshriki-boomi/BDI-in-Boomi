import { action } from '@storybook/addon-actions';
import React, { useCallback } from 'react';
import { IconPicker } from './IconPicker';

export default {
  title: 'Components/IconPicker',
  component: IconPicker,
} as any;

const Template = ({ selected, color }) => {
  const [selectedIcon, setSelectedIcon] = React.useState(selected);
  const onSelect = useCallback(icon => {
    action('icon')(icon);
    setSelectedIcon(icon);
  }, []);
  return (
    <IconPicker color={color} selected={selectedIcon} onChange={onSelect} />
  );
};
export const Default = Template.bind({});
const icon = 'tshirt';

Default.args = {
  color: '#7d7094',
  presets: null,
  selected: icon,
};
