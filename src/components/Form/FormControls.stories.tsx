import { InputTypes } from 'components/Form/components';
import React from 'react';
import { FormControls, FormControlsProps } from './FormControls';

export default {
  title: 'FormRenderer/FormControls',
  component: FormControls,
} as any;

const Template = args => <FormControls {...args} />;

export const OneField = Template.bind({});
OneField.args = {
  register: () => null,
  controls: [
    {
      type: InputTypes.TEXT,
      name: 'username',
      display_name: 'User Name',
      label: 'User Name',
      required: true,
      placeholder: 'User Name',
      width: 100,
    },
  ],
};

export const MultipleFields = Template.bind({});
MultipleFields.args = {
  register: () => null,
  controls: [
    {
      type: InputTypes.TEXT,
      name: 'warehouse',
      display_name: 'Warehouse',
      required: true,
    },
    {
      type: InputTypes.TEXT,
      name: 'connection_type',
      display_name: 'Connection Type',
      required: true,
    },
  ],
};

export const Help = Template.bind({});
Help.args = {
  register: () => null,
  controls: [
    {
      type: InputTypes.TEXT,
      name: 'username',
      display_name: 'User Name',
      label: 'User Name',
      required: true,
      placeholder: 'User Name',
      help: 'This is an optional help text for all controls (not html) that will be renderd below the control',
    },
  ],
} as FormControlsProps;
