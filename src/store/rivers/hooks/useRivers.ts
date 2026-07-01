import { shallowEqual, useSelector } from 'react-redux';
import * as selectors from '../rivers.selectors';

export function useRivers() {
  const state = {
    riversEntities: useSelector(selectors.selectRiversEntities, shallowEqual),
    riversArray: useSelector(selectors.selectRiversArray, shallowEqual),
    total: useSelector(selectors.selectTotalRivers),
    selectedId: useSelector(selectors.selectSelectedRivers),
  };

  return state;
}
