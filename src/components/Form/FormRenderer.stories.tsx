import { action } from '@storybook/addon-actions';
import RiveryButton from 'components/Buttons/RiveryButton';
import React from 'react';
import { FormRenderer } from './FormRenderer';
import { controls } from './mocks/controls';

export default {
  title: 'FormRenderer/FormRenderer',
  component: FormRenderer,
} as any;

const Template = args => <FormRenderer {...args} />;

export const MultipleControls = Template.bind({});
MultipleControls.args = {
  controls,
};

const TemplateWithFormData = args => {
  const onSubmit = formData => {
    action('formData')(formData);
  };

  return (
    <div>
      <FormRenderer {...args} formData={args.formData} onSubmit={onSubmit}>
        <RiveryButton label="Log To Actions" type="submit" />
      </FormRenderer>
    </div>
  );
};

export const KeyValueList = TemplateWithFormData.bind({});
KeyValueList.args = {
  formData: {
    details: [
      {
        is_from_oauth2: true,
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
    ],
  },
  controls: [
    {
      type: 'key-value',
      name: 'details',
    },
  ],
};

export const CollapseWithSelectSingle = TemplateWithFormData.bind({});
CollapseWithSelectSingle.args = {
  formData: { sslmode: 'require' },
  controls: [
    {
      display_name: 'SSL Options',
      type: 'collapse',
      controls: [
        {
          display_name: 'SSL Mode',
          options: [
            { id: 'disable', name: 'Disable' },
            { id: 'allow', name: 'Allow' },
            { id: 'prefer', name: 'Prefer' },
            { id: 'require', name: 'Require' },
            { id: 'verify-ca', name: 'Verify-CA' },
            { id: 'verify-full', name: 'Verify-Full' },
          ],
          type: 'list_single_options',
          name: 'sslmode',
          width: 264.0,
        },
      ],
    },
  ],
};
