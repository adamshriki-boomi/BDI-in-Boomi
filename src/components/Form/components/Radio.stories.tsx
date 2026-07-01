import { action } from '@storybook/addon-actions';
import RiveryButton from 'components/Buttons/RiveryButton';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Radio, RadioProps } from './Radio';

export default {
  title: 'FormRenderer/Radio',
  component: Radio,
} as any;

const Template = ({ control, checked = '' }) => {
  const { handleSubmit, ...useFormApi } = useForm({
    defaultValues: {
      [control.name]: checked,
    },
  });

  const onSubmit = formData => {
    action('formData')(formData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Radio {...control} api={useFormApi as any} />
        <RiveryButton label="Log To Actions" type="submit" mt={2} />
      </form>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  control: {
    type: 'radio',
    label: 'Scope',
    placeholder: 'Scope',
    name: 'request_scope',
    values: [
      { label: 'Authorization Code', value: 'authorization_code' },
      { label: 'Client Credentials', value: 'client_credentials' },
    ],
  } as RadioProps,
};
export const PreChecked = Template.bind({});
PreChecked.args = {
  checked: 'client_credentials',
  control: {
    type: 'radio',
    label: 'Scope',
    placeholder: 'Scope',
    name: 'request_scope',
    values: [
      { label: 'Authorization Code', value: 'authorization_code' },
      { label: 'Client Credentials', value: 'client_credentials' },
    ],
  } as RadioProps,
};
