import { Box } from 'components';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from 'store';
import { getHashKey } from 'utils/api.sanitizer';
import { riverLogicWithNesting } from '../__mocks__/logic.with.nesting';
import { TreeNode } from './TreeNode';

export default {
  title: 'containers/RiverBox/RiverLogic',
  component: TreeNode,
} as any;

const ActionsMocker = ({ children }) => {
  return (
    <Box w="full" h="full">
      {children}
    </Box>
  );
};

const Template = args => {
  const steps =
    riverLogicWithNesting.tasks_definitions[0].task_config.logic_steps;
  return (
    <Provider store={store}>
      <MemoryRouter>
        <ActionsMocker>
          <div>
            {steps?.map(step => (
              <TreeNode node={step} {...args} key={getHashKey(step)} />
            ))}
          </div>
        </ActionsMocker>
      </MemoryRouter>
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {};
