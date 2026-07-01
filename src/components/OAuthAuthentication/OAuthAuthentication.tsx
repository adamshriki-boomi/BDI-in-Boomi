import { ControlList } from 'api/types';
import RiveryAlert from 'components/Alert/Alert';
import RiveryButton from 'components/Buttons/RiveryButton';
import { FormRenderer } from 'components/Form';
import { useProviderAuthPoller } from 'hooks';
import React from 'react';

export type OAuthAuthenticationProps = {
  onResult: (credentials: any) => any;
  api: any;
};

export function OAuthAuthentication({
  onResult,
  api,
}: OAuthAuthenticationProps) {
  const { activatePoller } = useProviderAuthPoller({
    onSuccess: onResult,
    api: api,
  });
  const handleOnSubmit = formData => {
    // integrate api call
    console.log(formData, activatePoller);
    onResult(formData);
    // TODO 3/2: do empty fields should be removed?
    // activatePoller(formData)
  };

  return (
    <div>
      <RiveryAlert
        variant="info"
        description="Callback URL: https://console.rivery.io/api/oauthcallback/custom - Set
          this as the callback URL in your app settings page."
      />
      <FormRenderer
        controls={controls}
        formData={createNewOAuth()}
        onSubmit={handleOnSubmit}
      >
        <RiveryButton variant="primary" type="submit" label="Submit OAuth2" />
      </FormRenderer>
    </div>
  );
}
const createNewOAuth = () => ({
  access_token_url: '',
  auth_url: '',
  client_id: '',
  client_secret: '',
  datasource_id: '',
  grant_type: 'authorization_code', // | client_credentials
  request_scope: [],
  required_mapping_flag: true,
  // props inside toggle
  access_type: 'offline',
  response_type: 'code',
  // optional in request if include value
  auth_type: '',
  base_url: '',
});

const controls = [
  {
    type: ControlList.INPUT_TEXT,
    label: 'Authentication Url',
    placeholder: 'Auth URL',
    name: 'auth_url',
    required: true,
  },
  {
    type: ControlList.INPUT_TEXT,
    label: 'Access Token Url',
    placeholder: 'Access Token Url',
    name: 'access_token_url',
    required: true,
  },
  {
    type: ControlList.INPUT_TEXT,
    label: 'Client ID',
    placeholder: 'Client ID',
    name: 'client_id',
    required: true,
  },
  {
    type: ControlList.INPUT_TEXT,
    label: 'Client Secret',
    placeholder: 'Client Secret',
    name: 'client_secret',
    required: true,
  },
  {
    type: ControlList.RADIO,
    label: 'Scope',
    placeholder: 'Scope',
    name: 'request_scope',
    values: [
      { label: 'Authorization Code', value: 'authorization_code' },
      { label: 'Client Credentials', value: 'client_credentials' },
    ],
  },
  {
    type: 'grant',
    label: 'Grant Type',
    placeholder: 'Scope',
    name: 'grant_type',
  },
  {
    type: ControlList.COLLAPSE,
    display_name: 'Additional Options',
    controls: [
      {
        type: ControlList.INPUT_TEXT,
        label: 'Access Type',
        placeholder: 'Access Type',
        name: 'access_type',
      },
      {
        type: ControlList.INPUT_TEXT,
        label: 'Response Type',
        placeholder: 'Response Type',
        name: 'response_type',
      },
      {
        type: ControlList.INPUT_TEXT,
        label: 'Auth Type',
        placeholder: 'Auth Type',
        name: 'auth_type',
      },
      {
        type: ControlList.INPUT_TEXT,
        label: 'Base Url',
        placeholder: 'Base Url',
        name: 'base_url',
      },
      {
        type: ControlList.KEYVALUE,
        label: 'Additional Options',
        name: 'additional_options',
      },
    ],
  },
];
