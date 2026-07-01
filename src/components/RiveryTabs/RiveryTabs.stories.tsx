import React from 'react';
import { GiGuitarHead, GiMeditation } from 'react-icons/gi';
import { MemoryRouter, Route } from 'react-router-dom';
import { RiveryTabs, RiveryTabsProps } from './RiveryTabs';

export default {
  title: 'components/RiveryTabs',
  component: RiveryTabs,
} as any;

const Template = ({ pathname, tabs }) => (
  <MemoryRouter initialEntries={[{ pathname }]}>
    <Route path="/demo/:section" component={() => <RiveryTabs {...tabs} />} />
    <Route path="/demo" component={() => <RiveryTabs {...tabs} />} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {
  pathname: '/demo',
  tabs: {
    items: [
      {
        route: 'demo',
        component: () => (
          <div>
            <h2>route: DEMO</h2>
          </div>
        ),
        title: 'Demo',
      },
      {
        route: 'icons',
        component: () => (
          <div>
            <h2>route: Icons</h2>
            <GiGuitarHead size="60" /> <GiMeditation size="60" />
          </div>
        ),
        title: 'Icons',
      },
    ],
    route: '/demo',
  } as RiveryTabsProps,
};

export const NestedTab = Template.bind({});
NestedTab.args = {
  pathname: '/demo/icons',
  tabs: {
    items: [
      {
        route: 'demo',
        component: () => (
          <div>
            <h2>route: DEMO</h2>
          </div>
        ),
        title: 'Demo',
      },
      {
        route: 'icons',
        component: () => (
          <div>
            <h2>route: Icons</h2>
            <GiGuitarHead size="60" /> <GiMeditation size="60" />
          </div>
        ),
        title: 'Icons',
      },
    ],
    route: 'demo',
  } as RiveryTabsProps,
};
