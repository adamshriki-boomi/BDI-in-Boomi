import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from 'store';
import { ScriptEditor } from './ScriptEditor';

export default {
  title: 'components/ScriptEditor',
  component: ScriptEditor,
  argTypes: {
    routes: {
      control: {
        type: 'object',
      },
    },
  },
} as any;

const ActionsMocker = ({ children }) => {
  return (
    <Box h="full" w="full">
      {children}
    </Box>
  );
};

const Template = args => {
  const [value, setValue] = useState(args.value);

  return (
    <Provider store={store}>
      <MemoryRouter>
        <ActionsMocker>
          <ScriptEditor
            {...args}
            value={value}
            onChange={v => {
              setValue(v);
              args.onChange?.(v);
            }}
          />
        </ActionsMocker>
      </MemoryRouter>
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {
  path: 'test-path',
  language: 'sql',
  onChange: console.log,
  value: 'select * from users',
};
