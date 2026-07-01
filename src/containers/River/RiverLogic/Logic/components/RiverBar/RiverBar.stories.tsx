import { action } from '@storybook/addon-actions';
import React, { useCallback, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from 'store';
import { rivers } from '../../__mocks__/rivers';
import { RiverBar } from './RiverBar';

export default {
  title: 'Components/RiverBar',
  component: RiverBar,
} as any;

const Template = args => {
  const [selected, setSelected] = useState(args.selectedRiver);
  const externalOnchange = args.onChange;
  const onChange = useCallback(
    value => {
      setSelected(value);
      externalOnchange?.(value);
    },
    [externalOnchange],
  );

  return (
    <Provider store={store}>
      <RiverBar
        {...args}
        editInAnotherTab={true}
        selectedRiver={selected}
        onChange={onChange}
      />
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {
  rivers,
  envId: '563fa39cdf14e54426d464ea',
  accountId: '55bf7c4270fdca16cac18761',
  onChange: action('selected river'),
  selectedRiver: rivers[0],
};
