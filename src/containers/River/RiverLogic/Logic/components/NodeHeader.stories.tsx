import { action } from '@storybook/addon-actions';
import { Box } from 'components';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { useToggle } from 'react-use';
import { store } from 'store';
import { NodeType } from 'store/river/river.types';
import { NodeHeader } from './NodeHeader';

export default {
  title: 'containers/RiverBox/RiverLogic/Header',
  component: NodeHeader,
} as any;

const ActionsMocker = ({ children }) => {
  return (
    <Box w="full" h="100">
      {children}
    </Box>
  );
};

const Template = args => {
  const [open, toggle] = useToggle(args.open);
  const [text, setText] = useState(args.text);

  const onNameChange = (newName: string) => {
    action('nameUpdated')(newName);
    setText(newName);
  };
  useEffect(() => {
    toggle(args.open);
  }, [toggle, args.open]);
  return (
    <Provider store={store}>
      <MemoryRouter>
        <ActionsMocker>
          <div>
            <NodeHeader
              {...args}
              text={text}
              open={open}
              onCollapse={() => toggle()}
              onNameChange={onNameChange}
            />
          </div>
        </ActionsMocker>
      </MemoryRouter>
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {
  open: false,
  text: 'some fake step name',
  type: NodeType.STEP,
  status: NodeHeader.status.DONE,
  stepType: NodeHeader.stepType.SQL,
  errorMessage: 'some fake error message',
};
