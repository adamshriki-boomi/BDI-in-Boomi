import { InputTypes } from 'components/Form/components/Input';
import React from 'react';
import { Secret, SecretProps } from './Secret';

export default {
  title: 'FormRenderer/Secret',
  component: Secret,
} as any;

const Template = args => <Secret {...args} />;

export const Default = Template.bind({});
Default.args = {
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
export const PreDefinedValue = Template.bind({});
PreDefinedValue.args = {
  type: InputTypes.TEXT,
  name: 'username',
  display_name: 'User Name',
  label: 'User Name',
  required: true,
  placeholder: 'User Name',
  defaultValue: '12345',
  api: {
    formState: { errors: { username: { message: 'this is required' } } },
    watch: console.log,
  } as any,
} as SecretProps;
