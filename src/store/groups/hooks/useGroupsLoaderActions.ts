import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as effects from '../groups.effects';
import { slice } from '../groups.reducer';

export function useGroupsActions() {
  const dispatch = useDispatch();
  return useMemo(
    () => bindActionCreators({ ...slice.actions, ...effects }, dispatch),
    [dispatch],
  );
}
