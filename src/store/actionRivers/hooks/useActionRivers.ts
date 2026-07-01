import { useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as effects from '../actionRivers.effects';
import { slice } from '../actionRivers.reducer';
import * as selectors from '../actionRivers.selectors';

export function useActionRivers() {
  return {
    actionRiversEntities: useSelector(
      selectors.selectActionRiversEntities,
      shallowEqual,
    ),
    actionRiversArray: useSelector(
      selectors.selectActionRiversArray,
      shallowEqual,
    ),
    total: useSelector(selectors.selectTotalActionRivers),
  };
}

export function useActionRiversActions() {
  const dispatch = useDispatch();

  return useMemo(
    () => bindActionCreators({ ...slice.actions, ...effects }, dispatch),
    [dispatch],
  );
}
