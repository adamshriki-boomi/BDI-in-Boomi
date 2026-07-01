import { shallowEqual, useSelector } from 'react-redux';
import * as selectors from '../groups.selectors';

export function useGroupsState() {
  const state = {
    groupsEntities: useSelector(selectors.selectGroupsEntities, shallowEqual),
    groups: useSelector(selectors.selectGroupsArray, shallowEqual),
    total: useSelector(selectors.selectTotalGroups),
    loading: useSelector(selectors.selectLoading),
    defaultGroup: useSelector(selectors.selectDefaultGroup),
  };

  return state;
}
