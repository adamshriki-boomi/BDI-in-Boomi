import { useEffect, useState, useMemo } from 'react';
import { useCore } from 'store/core';
import { compare } from 'utils/array.utils';
import {
  useGetActivitiesConsistencyMutation,
  useGetActivitiesQuery,
} from 'containers/Activities/store';
import { calculateTime } from 'utils/date.utils';
import { StatusTypes } from 'api/types';

export function useDashboardRecentActivities(
  status: 'all' | 'success' | 'failed',
) {
  const { envId, activeAccountId } = useCore();
  const [daysBack, setDaysBack] = useState(7);
  const timeRange = useMemo(() => {
    const { event_start_time, event_end_time } = calculateTime('D', daysBack);
    return {
      start_time: event_start_time,
      end_time: event_end_time,
    };
  }, [daysBack]);

  const statusFilter = useMemo(
    () =>
      status === 'all'
        ? []
        : status === 'success'
        ? [StatusTypes.SUCCEEDED]
        : [StatusTypes.FAILED],
    [status],
  );

  const params = useMemo(
    () => ({
      environment_id: envId,
      account_id: activeAccountId,
      start_time: timeRange?.start_time,
      end_time: timeRange?.end_time,
      page: 1,
      items_per_page: 5,
      status: statusFilter,
      return_last_runs: false,
    }),
    [
      envId,
      activeAccountId,
      timeRange?.start_time,
      timeRange?.end_time,
      statusFilter,
    ],
  );

  const hasAllRequiredParams = Boolean(
    envId && activeAccountId && params.start_time && params.end_time,
  );

  const { data, isLoading, isError } = useGetActivitiesQuery(params, {
    skip: !hasAllRequiredParams,
  });

  useEffect(() => {
    if (
      daysBack === 7 &&
      data &&
      Array.isArray(data.items) &&
      data.items.length === 0
    ) {
      setDaysBack(30);
    }
  }, [daysBack, data]);

  useEffect(() => {
    // if we change status, try 7 days again before fetching 30
    setDaysBack(7);
  }, [status]);

  const [activitiesData, setActivitiesData] = useState(null);
  const [consistencyData, setConsistencyData] = useState(null);
  const [getConsistency, { data: consistency }] =
    useGetActivitiesConsistencyMutation();

  useEffect(() => {
    setActivitiesData(data?.items ?? []);
    setConsistencyData([]);
  }, [data?.items]);

  useEffect(() => {
    if (
      activitiesData &&
      activitiesData.length > 0 &&
      consistencyData?.length === 0
    ) {
      const rivers = activitiesData.map(
        ({ master_river_id }) => master_river_id,
      );
      getConsistency({ rivers, end_time: timeRange.end_time });
    }
  }, [activitiesData, consistencyData, getConsistency, timeRange.end_time]);

  useEffect(() => {
    if (consistency?.items) {
      setConsistencyData(consistency.items);
    }
  }, [consistency?.items]);

  useEffect(() => {
    if (activitiesData && Boolean(consistencyData?.length)) {
      const dataWithLastRuns = activitiesData.map(row => {
        const consistencyItem = consistencyData.find(
          compare('river_id', row?.master_river_id),
        )?.last_runs;
        const last_runs = consistencyItem?.length > 0 ? consistencyItem : null;
        return {
          ...row,
          last_runs,
        };
      });
      setActivitiesData(dataWithLastRuns);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consistencyData]);

  return {
    data: activitiesData,
    isLoading,
    isError,
  };
}
