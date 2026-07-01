import { RiverSettings } from 'containers/River/Settings/RiverSettings';
import { Logic } from './Logic';

export const routes = [
  {
    route: 'steps',
    title: 'Logic Steps',
    component: Logic,
  },
  {
    route: 'settings',
    title: 'Settings',
    component: RiverSettings,
  },
];
