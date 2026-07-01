import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Grid } from 'components';
import React from 'react';
import { StatusDisplay } from './StatusDisplay';

export default {
  title: 'Containers/Activities/StatusDisplay',
  component: StatusDisplay,
} as ComponentMeta<typeof StatusDisplay>;

const Template: ComponentStory<typeof StatusDisplay> = props => (
  <Grid
    gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))"
    bgColor="white"
    shadow="lg"
    p="4"
  >
    <StatusDisplay {...props} />
  </Grid>
);
export const Default = Template.bind({});
Default.args = {
  running: 5,
  pending: 25,
  succeed: 30,
  failed: 15,
  canceled: 35,
};
export const RPUMini = Template.bind({});
RPUMini.args = {
  running: 5,
  pending: 25,
  succeed: 30,
  failed: 15,
  canceled: 35,
  rpu: 23,
};
export const ZeroMini = Template.bind({});
ZeroMini.args = {
  running: 0,
  pending: 0,
  succeed: 0,
  failed: 0,
  canceled: 0,
};
export const NoDataMini = Template.bind({});
NoDataMini.args = {};

export const Large = Template.bind({});
Large.args = {
  running: 5,
  pending: 25,
  succeed: 0,
  failed: 15,
  canceled: 35,
  mode: StatusDisplay.Mode.LARGE,
};
export const RPULarge = Template.bind({});
RPULarge.args = {
  running: 5,
  pending: 25,
  succeed: 0,
  failed: 15,
  canceled: 35,
  mode: StatusDisplay.Mode.LARGE,
  rpu: 23,
};
export const ZeroLarge = Template.bind({});
ZeroLarge.args = {
  running: 0,
  pending: 0,
  succeed: 0,
  failed: 0,
  canceled: 0,
  mode: StatusDisplay.Mode.LARGE,
};

export const NoDataLarge = Template.bind({});
NoDataLarge.args = {
  mode: StatusDisplay.Mode.LARGE,
};
