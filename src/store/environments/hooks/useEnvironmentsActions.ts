import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as effects from '../environments.effects';
import { slice } from '../environments.reducer';

export function useEnvironmentsActions() {
  const dispatch = useDispatch();
  const bindedActions = useMemo(
    () => bindActionCreators({ ...slice.actions, ...effects }, dispatch),
    [dispatch],
  );

  return bindedActions;
}
