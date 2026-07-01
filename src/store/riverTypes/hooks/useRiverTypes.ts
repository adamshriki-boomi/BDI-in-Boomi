import { shallowEqual, useSelector } from 'react-redux';
import * as selectors from '../riverTypes.selectors';

export function useRiverTypes() {
  const state = {
    riverTypesEntities: useSelector(
      selectors.selectRiverTypesEntities,
      shallowEqual,
    ),
    riverTypes: useSelector(selectors.selectRiverTypesArray, shallowEqual),
    total: useSelector(selectors.selectTotalRiverTypes),
    loading: useSelector(selectors.selectLoading),
  };

  return state;
}
