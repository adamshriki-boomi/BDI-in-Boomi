import { useDashboardDataQuery } from '../dashboard.query';
import { useDashboardRequestBody } from './useDashboardRequestBody';

export function useDashboardData() {
  const requestBody = useDashboardRequestBody();

  const queryResult = useDashboardDataQuery(requestBody, {
    refetchOnMountOrArgChange: true,
  });

  const { data, isLoading, isFetching, error } = queryResult;

  return {
    data,
    isLoading: isLoading || isFetching,
    error,
    requestBody,
  };
}
