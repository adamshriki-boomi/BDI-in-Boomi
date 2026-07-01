import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as effects from '../__templateName__.effects';
import { slice } from '../__templateName__.reducer';

export function use__templateNameToPascalCase__Actions() {
  const dispatch = useDispatch();
  const bindedActions = useMemo(
    () => bindActionCreators({ ...slice.actions, ...effects }, dispatch),
    [dispatch],
  );

  return bindedActions;
}
