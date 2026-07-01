import { useSelector } from 'react-redux';
import * as selectors from '../river.selectors';

export function useRiverRun() {
  const state = {
    details: useSelector(selectors.selectRunDetails),
    hasDetails: useSelector(selectors.selectIsRunDetailsAvailable),
    isWaiting: useSelector(selectors.selectRunWaiting),
    stepsStatus: useSelector(selectors.selectRunStepsStatus),
  };

  return state;
}
