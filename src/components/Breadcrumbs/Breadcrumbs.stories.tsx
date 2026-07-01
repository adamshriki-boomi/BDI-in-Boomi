import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';

export default {
  title: 'components/Breadcrumbs',
  component: Breadcrumbs,
} as any;

const Template = ({ links }) => (
  <MemoryRouter initialEntries={[{ pathname: 'home' }]}>
    <Breadcrumbs links={links} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {
  links: [
    { label: 'Home', href: '/home' },
    { label: 'Activities', href: 'activities' },
  ],
};

export const NoLinks = Template.bind({});
NoLinks.args = {
  links: [
    { label: 'Home', href: '/home' },
    { label: 'Monitoring', href: '/monitoring' },
    { label: 'This is not a link' },
  ],
};
