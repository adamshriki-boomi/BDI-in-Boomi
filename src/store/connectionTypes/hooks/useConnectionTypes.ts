import { shallowEqual, useSelector } from 'react-redux';
import * as selectors from '../connectionTypes.selectors';

export function useConnectionTypes() {
  const state = {
    loading: useSelector(selectors.selectLoading),
    entities: useSelector(
      selectors.selectConnectionTypesEntities,
      shallowEqual,
    ),
    connectionsArray: useSelector(
      selectors.selectConnectionTypesArray,
      shallowEqual,
    ),
    total: useSelector(selectors.selectTotalConnectionTypes),
    selectedId: useSelector(selectors.selectSelectedConnectionTypes),
  };

  return state;
}
