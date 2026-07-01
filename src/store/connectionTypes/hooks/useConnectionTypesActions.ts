import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as effects from '../connectionTypes.effects';
import { slice } from '../connectionTypes.reducer';

export function useConnectionTypesActions() {
  const dispatch = useDispatch();

  const bindedActions = useMemo(
    () => bindActionCreators({ ...slice.actions, ...effects }, dispatch),
    [dispatch],
  );

  return bindedActions;
}
