import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as effects from '../riverTypes.effects';
import { slice } from '../riverTypes.reducer';

export function useRiverTypesActions() {
  const dispatch = useDispatch();
  return useMemo(
    () => bindActionCreators({ ...slice.actions, ...effects }, dispatch),
    [dispatch],
  );
}
