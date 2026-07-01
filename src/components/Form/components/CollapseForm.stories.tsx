import { Meta, Story } from '@storybook/react/types-6-0';
import { InputTypes } from 'components/Form/components/Input';
import React from 'react';
import { CollapseForm, CollapseFormProps } from './CollapseForm';

export default {
  title: 'FormRenderer/CollapseFormControl',
  component: CollapseForm,
} as Meta;

const Template: Story<CollapseFormProps> = args => <CollapseForm {...args} />;

export const CollapseFormControl = Template.bind({});
CollapseFormControl.args = {
  type: 'collapse',
  display_name: 'SSH Options',
  controls: [
    [
      {
        type: InputTypes.TEXT,
        name: 'aws_access_key',
        display_name: 'AWS Access Key',
        required: true,
      },
      {
        type: InputTypes.PASSWORD,
        name: 'aws_access_secret',
        display_name: 'AWS Access Secret',
        required: true,
      },
    ],
    [
      {
        type: 'connect_with',
        name: 'google',
      },
    ],
  ],
};
