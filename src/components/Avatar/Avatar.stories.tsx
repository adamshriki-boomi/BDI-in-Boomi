import React from 'react';
import { Avatar } from './Avatar';

export default {
  title: 'Components/Avatar',
  component: Avatar,
} as any;

const Template = args => <Avatar {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'Rivery Tester',
  size: 0,
};
