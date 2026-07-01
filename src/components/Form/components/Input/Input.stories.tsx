import React from 'react';
import { MdMonetizationOn } from 'react-icons/md';
import { Input, InputProps, InputTypes } from '.';

export default {
  title: 'FormRenderer/Input',
  component: Input,
} as any;

const Template = args => (
  <div>
    <Input {...args} />
    <Input
      {...args}
      type={InputTypes.PASSWORD}
      placeholder="password"
      label="password"
    />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  type: 'text',
  name: 'username',
  display_name: 'User Name',
  label: 'User Name',
  required: true,
  placeholder: 'User Name',
  width: 100,
  api: {
    formState: { errors: { username: { message: 'this is required' } } },
    watch: console.log,
  } as any,
} as InputProps;
export const Error = Template.bind({});
Error.args = {
  type: 'text',
  name: 'username',
  display_name: 'User Name',
  label: 'User Name',
  required: true,
  placeholder: 'User Name',
  api: {
    formState: { errors: { username: { message: 'this is required' } } },
    watch: console.log,
  } as any,
} as InputProps;

export const Chakra = Template.bind({});
Chakra.args = {
  type: 'text',
  chakra: true,
  name: 'username',
  display_name: 'User Name',
  label: 'User Name',
  placeholder: 'User Name',
  api: {
    formState: {},
    watch: console.log,
  } as any,
} as InputProps;
export const Icon = Template.bind({});
Icon.args = {
  type: 'text',
  name: 'username',
  display_name: 'User Name',
  label: 'User Name',
  required: true,
  placeholder: 'User Name',
  icon: <MdMonetizationOn size={24} />,
  api: {
    formState: { errors: { username: { message: 'this is required' } } },
    watch: console.log,
  } as any,
} as InputProps;
