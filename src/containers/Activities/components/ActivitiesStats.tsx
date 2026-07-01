import { getQueryParams } from 'hooks/router';
import { useEffect } from 'react';
import { useRiverTypes } from 'store/riverTypes';
import { pluck } from 'utils/array.utils';
import { useGetActivitiesStatsQuery } from '../store';
import { StatusDisplay } from './StatusDisplay';

const buildParams = (params, riverTypes) => {
  const urlParams = getQueryParams([
    'is_scheduled',
    'start_time',
    'end_time',
    'search',
  ]);
  const group_id = params?.group_id || [];
  const river_type = params?.river_type || riverTypes.map(pluck('type'));
  const is_scheduled = urlParams?.is_scheduled;
  const end_time = urlParams.end_time;
  const start_time = urlParams.start_time;
  const search = urlParams.search;
  delete params.status;
  return {
    ...params,
    start_time,
    end_time,
    river_type,
    group_id,
    is_scheduled,
    search,
  };
};
export function ActivitiesStats({ params, api }) {
  const timeParams = getQueryParams(['is_scheduled', 'start_time']);
  const { riverTypes } = useRiverTypes();
  const endTime = getQueryParams(['end_time']);
  const { data, refetch, isError, isLoading, isFetching } =
    useGetActivitiesStatsQuery(buildParams(params, riverTypes), {
      skip: !Boolean(Object.values(timeParams).length),
    });
  //In order to refetch upon refresh click
  useEffect(() => {
    if (data && (!isLoading || !isFetching)) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTime?.end_time]);

  const noValues = isError || isLoading || isFetching;
  return noValues ? null : (
    <StatusDisplay
      {...data}
      api={api}
      rpu={data?.total_units}
      mode={StatusDisplay.Mode.LARGE}
    />
  );
}
