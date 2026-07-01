import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Grid } from 'components';
import React from 'react';
import { RunsBarCharts } from './RunsBarCharts';

export default {
  title: 'Containers/Activities/RunsBarCharts',
  component: RunsBarCharts,
} as ComponentMeta<typeof RunsBarCharts>;

const Template: ComponentStory<typeof RunsBarCharts> = props => (
  <Grid bgColor="white" shadow="lg" p="4" h="100px">
    <RunsBarCharts {...props} />
  </Grid>
);
export const Default = Template.bind({});
Default.args = {
  value: [
    {
      status: 'succeed',
      max_run_duration_milliseconds: 78000,
      run_group_id: '00ac56e87445492398a73f7cde2ced58',
      units: 1,
    },
    {
      status: 'succeed',
      max_run_duration_milliseconds: 77000,
      run_group_id: '51ec1f8c4a2740038b20addd28b62ff8',
      units: 1,
    },
    {
      status: 'failed',
      max_run_duration_milliseconds: 38000,
      run_group_id: 'ee9394e43c2c45eaae0665f31468d7a3',
      units: 0,
    },
    {
      status: 'succeed',
      max_run_duration_milliseconds: 76000,
      run_group_id: 'f18a11b4899d435fa4fee78d4ab82fa0',
      units: 1,
    },
    {
      status: 'succeed',
      max_run_duration_milliseconds: 76000,
      run_group_id: '843d6c0db78344b0b5fee2fa3c7b27b2',
      units: 1,
    },
    {
      status: 'succeed',
      max_run_duration_milliseconds: 76000,
      run_group_id: '66b01f367e03448b8576243f77bf5510',
      units: 1,
    },
    {
      status: 'succeed',
      max_run_duration_milliseconds: 146000,
      run_group_id: '0b49373c300e4232bf23629bbab64362',
      units: 1,
    },
    {
      status: 'failed',
      max_run_duration_milliseconds: 23000,
      run_group_id: 'b45d61a80a864d66a196eb1435cbc779',
      units: 0,
    },
    {
      status: 'running',
      max_run_duration_milliseconds: 5000,
      run_group_id: '89193245295a4f9998c3133b05c833b6',
      units: 0,
    },
    {
      status: 'succeed',
      max_run_duration_milliseconds: 70000,
      run_group_id: '04cbe51af34b42d692f8098e54962479',
      units: 1,
    },
  ],
};
