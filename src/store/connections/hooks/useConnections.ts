import { useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as effects from '../connections.effects';
import { slice } from '../connections.reducer';
import * as selectors from '../connections.selectors';

export function useConnections() {
  const dispatch = useDispatch();

  const state = {
    connectionsEntities: useSelector(
      selectors.selectConnectionsEntities,
      shallowEqual,
    ),
    connectionsArray: useSelector(
      selectors.selectConnectionsArray,
      shallowEqual,
    ),
    total: useSelector(selectors.selectTotalConnections),
    selectedId: useSelector(selectors.selectSelectedConnections),
  };
  const bindedActions = useMemo(
    () => bindActionCreators({ ...slice.actions, ...effects }, dispatch),
    [dispatch],
  );

  return {
    ...state,
    ...bindedActions,
  };
}
