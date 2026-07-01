import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as effects from '../rivers.effects';
import { slice } from '../rivers.reducer';

export function useRiversActions() {
  const dispatch = useDispatch();

  return useMemo(
    () => bindActionCreators({ ...slice.actions, ...effects }, dispatch),
    [dispatch],
  );
}
