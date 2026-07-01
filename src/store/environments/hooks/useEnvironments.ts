import { shallowEqual, useSelector } from 'react-redux';
import * as selectors from '../environments.selectors';

export function useEnvironments() {
  const state = {
    variables: useSelector(selectors.variablesFromEnvironments, shallowEqual),
    isDrawerOpen: useSelector(selectors.variableDrawerState),
  };

  return state;
}
