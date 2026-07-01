import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as effects from '../core.effects';
import { slice } from '../core.reducer';

export function useCoreActions() {
  const dispatch = useDispatch();
  const bindedActions = useMemo(
    () => bindActionCreators({ ...slice.actions, ...effects }, dispatch),
    [dispatch],
  );

  return bindedActions;
}
