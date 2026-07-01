import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from 'store';
import { Logic } from './Logic';
import {
  fetchRiverContainerOnlyPayload,
  fetchRiverPayload,
  selectRiver,
} from './__mocks__/fetchRiver.fullfilled';

export default {
  title: 'containers/RiverBox/Logic',
  component: Logic,
} as any;

const ActionsMocker = ({ children, fetchRiverAction }) => {
  console.log({ fetchRiverAction });

  [fetchRiverAction, selectRiver].forEach(store.dispatch);
  return <div>{children}</div>;
};

const Template = args => {
  return (
    <Provider store={store}>
      <MemoryRouter>
        <ActionsMocker {...args}>
          <Logic />
        </ActionsMocker>
      </MemoryRouter>
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {
  fetchRiverAction: fetchRiverPayload,
};

export const ContainerOnly = Template.bind({});
ContainerOnly.args = {
  fetchRiverAction: fetchRiverContainerOnlyPayload,
};
