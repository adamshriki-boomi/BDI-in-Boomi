import { action } from '@storybook/addon-actions';
import React from 'react';
import { RiveryDatePicker } from './RiveryDatePicker';

export default {
  title: 'FormRenderer/RiveryDatePicker',
  component: RiveryDatePicker,
} as any;

const Template = args => <RiveryDatePicker {...args} />;

export const Default = Template.bind({});
Default.args = {
  setPickerValue: action('setPickerValue'),
};
