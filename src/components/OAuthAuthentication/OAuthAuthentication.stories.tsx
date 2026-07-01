import { action } from '@storybook/addon-actions';
import React from 'react';
import { OAuthAuthentication } from './OAuthAuthentication';

export default {
  title: 'Components/OAuthAuthentication',
  component: OAuthAuthentication,
} as any;

const Template = args => {
  const onResult = formData => {
    action('poller result')(formData);
  };
  return <OAuthAuthentication {...args} onResult={onResult} />;
};

export const Default = Template.bind({});
Default.args = {};
