import React from 'react';
import { Content } from './Content';

export default {
  title: 'FormRenderer/Content',
  component: Content,
} as any;

const Template = args => <Content {...args} />;

export const Default = Template.bind({});
Default.args = {
  type: 'content',
  content: `this content is a simple text component that is defined with { type: "content", content: "someText" }`,
};

export const WithVariant = Template.bind({});
WithVariant.args = {
  type: 'content',
  variant: 'danger',
  content: `this content is a simple text component that is defined with { variant: 'danger' }`,
};
