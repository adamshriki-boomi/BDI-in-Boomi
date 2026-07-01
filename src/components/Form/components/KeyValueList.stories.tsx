import { action } from '@storybook/addon-actions';
import React from 'react';
import { useForm } from 'react-hook-form';
import { KeyValueList, KeyValueListProps } from './KeyValueList';

export default {
  title: 'FormRenderer/KeyValueList',
  component: KeyValueList,
} as any;

const Template = args => {
  const { register, handleSubmit, ...useFormApi } = useForm({
    defaultValues: {
      [args.name]: [
        {
          is_from_oauth2: true,
          // TODO: handle case where is_password doesn't exist
          is_password: false,
          key: 'access_token',
          value: '54315315lkjlk321j4lk',
        },
        {
          is_from_oauth2: true,
          is_password: true,
          key: 'expires_in',
          value: '3600',
        },
        {
          is_from_oauth2: true,
          is_password: false,
          key: 'connections',
          value: '72',
        },
      ],
    },
  });

  const onSubmit = formData => {
    action('formData')(formData[args.name]);
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <KeyValueList {...args} api={useFormApi} keys={args.keys} />
        <button type="submit">Log To Actions</button>
      </form>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  type: 'key-value',
  label: 'Key Value List',
  name: 'details',
} as KeyValueListProps;
