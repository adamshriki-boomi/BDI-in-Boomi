import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as effects from '../river.effects';
import { slice } from '../river.reducer';

export function useRiverActions() {
  const dispatch = useDispatch();
  return useMemo(
    () => bindActionCreators({ ...slice.actions, ...effects }, dispatch),
    [dispatch],
  );
}
