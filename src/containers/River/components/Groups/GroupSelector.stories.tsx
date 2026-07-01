import { action } from '@storybook/addon-actions';
import { Box } from 'components';
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from 'store';
import { getCrossId } from 'utils/api.sanitizer';
import { groups } from '../__mocks__/groups';
import { GroupSelector } from './GroupSelector';

export default {
  title: 'containers/GroupSelector',
  component: GroupSelector,
} as any;

const ActionsMocker = ({ children }) => {
  return (
    <Box w="full" h="full">
      {children}
    </Box>
  );
};

const Template = args => {
  const [selectedGroup, setSelectedGroup] = useState(
    getCrossId(args.groups[0]),
  );
  const onSelect = group => {
    action('Select Group')(group);
    setSelectedGroup(getCrossId(group));
  };
  return (
    <Provider store={store}>
      <MemoryRouter>
        <ActionsMocker>
          <GroupSelector
            {...args}
            selected={selectedGroup}
            onEdit={action('Edit Group')}
            onCreate={action('Create Group')}
            onSelect={onSelect}
          />
        </ActionsMocker>
      </MemoryRouter>
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {
  groups,
};
