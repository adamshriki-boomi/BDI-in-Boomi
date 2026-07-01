import { useMemo } from 'react';
import { useSearchParam } from 'react-use';
import { DRAWER_PARAM_NAME } from './config';

/**
 * get drawer param value
 * @value {string | function} when function, returns the result of value(paramValue)
 * @returns {array} [param value, is matched to value OR true result of value's function]
 */
export function useDrawerParam(value?: string | Function): [string, boolean] {
  const paramValue = useSearchParam(DRAWER_PARAM_NAME);
  const isMatched =
    typeof value === 'function' ? value(paramValue) : paramValue === value;
  return useMemo(() => [paramValue, isMatched], [paramValue, isMatched]);
}
