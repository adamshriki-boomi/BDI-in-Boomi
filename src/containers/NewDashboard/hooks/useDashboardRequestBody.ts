import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { calculateTime } from 'utils/date.utils';
import { DashboardDataRequest, METRICS, VIEWS } from '../dashboard.query';
import { isLastXDaysRange } from '../DashboardDropdownUtils';

export function useDashboardRequestBody(): DashboardDataRequest {
  const { search } = useLocation();
  const {
    environments: environmentsParam,
    sources: sourcesParam,
    start_time: startTimeParam,
    end_time: endTimeParam,
    metric: metricParam,
    view: viewParam,
    timezone: timezoneParam,
  } = useMemo(() => queryString.parse(search), [search]);

  return useMemo<DashboardDataRequest>(() => {
    const defaultDateRange = calculateTime('D', 7);

    const environments = environmentsParam
      ? String(environmentsParam).split(',').filter(Boolean)
      : undefined;

    const sources = sourcesParam
      ? String(sourcesParam).split(',').filter(Boolean)
      : undefined;

    const start_time = startTimeParam
      ? Number(startTimeParam)
      : defaultDateRange.event_start_time;

    const end_time = endTimeParam
      ? Number(endTimeParam)
      : defaultDateRange.event_end_time;

    const metricValue = (metricParam || METRICS.EXECUTIONS) as string;
    const metric: DashboardDataRequest['metric'] =
      metricValue === METRICS.SUCCESS_RATE ||
      metricValue === METRICS.BDU ||
      metricValue === METRICS.EXECUTIONS
        ? (metricValue as DashboardDataRequest['metric'])
        : METRICS.EXECUTIONS;
    const view: DashboardDataRequest['view'] = (viewParam ||
      VIEWS.GENERAL) as DashboardDataRequest['view'];

    const timezoneMode = timezoneParam === 'utc' ? 'utc' : 'local';
    const isDefaultRange = !startTimeParam && !endTimeParam;
    const include_previous =
      view === VIEWS.GENERAL &&
      (isDefaultRange || isLastXDaysRange(start_time, timezoneMode));

    const result: DashboardDataRequest = {
      ...(environments && environments.length > 0 && { environments }),
      ...(sources && sources.length > 0 && { sources }),
      start_time,
      end_time,
      metric,
      view,
      include_previous,
    };
    return result;
  }, [
    environmentsParam,
    sourcesParam,
    startTimeParam,
    endTimeParam,
    metricParam,
    viewParam,
    timezoneParam,
  ]);
}
