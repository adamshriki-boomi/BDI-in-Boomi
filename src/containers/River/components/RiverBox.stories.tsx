import { IRiver } from 'api/types';
import { rest } from 'msw';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from 'store';
import RiverBox from './RiverBox';
import { groups } from './__mocks__/groups';
import { mockedRiver } from './__mocks__/river';

export default {
  title: 'containers/RiverBox',
  component: RiverBox,
  argTypes: {
    routes: {
      control: {
        type: 'object',
      },
    },
  },
} as any;

const ActionsMocker = ({ children }) => {
  return <div>{children}</div>;
};

const Template = args => {
  return (
    <Provider store={store}>
      <MemoryRouter>
        <ActionsMocker>
          <RiverBox {...args} />
        </ActionsMocker>
      </MemoryRouter>
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {
  river: mockedRiver as IRiver | any,
  parameters: {
    msw: [
      rest.put('/api/river_groups', (req, res, ctx) => {
        return res(ctx.json({ groups }));
      }),
    ],
  },
};
