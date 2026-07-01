import { useLocation } from 'react-router-dom';

interface RouteParamProps {
  param: string;
  value?: any;
  children: any;
}
/**
 * renders a component when param matches value
 */
export function RouteParam({ param, value, children }: RouteParamProps) {
  const query = useQuery();
  const hasParam = query.has(param);
  const render = value ? query.get(param) === value : hasParam;
  return render ? children : null;
}

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}
