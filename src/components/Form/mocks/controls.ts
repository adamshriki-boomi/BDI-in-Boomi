import { ControlList } from 'api/types';
import { InputTypes } from 'components/Form/components';
import { FontWeight } from '../components/KeyVal';
import { FormControl } from '../ControlResolver';

export const controls: Array<FormControl | FormControl[]> = [
  [
    {
      type: 'connect_with',
      name: 'google',
      provider: 'google',
    },
  ],
  {
    type: 'content',
    label: 'this is an example of Definition',
    display_name:
      'this content is a simple text component that is defined with  { type: "content", content: "someText" }',
  },
  {
    type: InputTypes.TEXT,
    name: 'username',
    display_name: 'User Name',
    required: true,
    placeholder: 'User Name',
    width: 100,
  },
  {
    type: InputTypes.TEXT,
    name: 'number_of_events',
    display_name: 'Number Number Of Events',
    required: true,
  },
  {
    type: 'input_password',
    name: 'password',
    display_name: 'password',
  },
  {
    type: InputTypes.PASSWORD,
    name: 'secret',
    display_name: 'Secret',
  },
  [
    {
      type: InputTypes.TEXT,
      name: 'connection_type_name',
      display_name: 'Connection Type Name',
      required: true,
      placeholder: 'User Name',
      width: 100,
    },
    {
      type: InputTypes.TEXT,
      name: 'account_name',
      display_name: 'Account Name',
      required: true,
    },
    {
      type: InputTypes.TEXT,
      name: 'database',
      display_name: 'Please Enter Database',
      required: true,
    },
  ],
  {
    type: 'radio',
    label: 'Scope',
    placeholder: 'Scope',
    name: 'request_scope',
    values: [
      { label: 'Authorization Code', value: 'authorization_code' },
      { label: 'Client Credentials', value: 'client_credentials' },
    ],
  },
  [
    {
      type: InputTypes.TEXT,
      name: 'warehouse',
      display_name: 'Warehouse',
      required: true,
    },
    {
      type: InputTypes.TEXT,
      name: 'connection_type',
      display_name: 'Connection Type',
      required: true,
    },
  ],
  {
    type: 'file',
    display_name: 'a file',
    name: 'key_file_path',
    file_type: 'p12',
    help: 'This is an optional help text for all controls (not html) that will be renderd below the control',
  },
  {
    type: 'checkbox',
    display_name: 'FZ',
    name: 'is_fz_connection',
  },
  {
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
    ],
  },
  {
    type: 'key-value',
    name: 'details',
  },
  {
    type: ControlList.KEY_VAL,
    display_name: ControlList.KEY_VAL,
    value: 33,
    fontWeight: FontWeight.MEDIUM,
  },
  {
    type: ControlList.TITLE,
    display_name: 'this is ControlList.TITLE',
  },
  {
    type: ControlList.GENERIC_SSH,
  },
];
