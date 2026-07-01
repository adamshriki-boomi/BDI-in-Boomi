import { action } from '@storybook/addon-actions';
import { connections } from 'containers/Connections/components/__mocks__/connections';
import React, { useCallback, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from 'store';
import { ConnectionBar } from './ConnectionBar';

export default {
  title: 'Components/ConnectionBar',
  component: ConnectionBar,
} as any;

const Template = args => {
  const [selected, setSelected] = useState(args.selectedConnection);
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
      <ConnectionBar
        {...args}
        selectedConnection={selected}
        onChange={onChange}
      />
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {
  connections,
  dataSourceId: 'snowflake',
  connectionHeader: 'Snowflake',
  connectionType: 'snowflake',
  onChange: action('selected connection'),
};
