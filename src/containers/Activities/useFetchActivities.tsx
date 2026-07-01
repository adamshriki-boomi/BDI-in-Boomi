import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useCore } from 'store/core';
import { compare } from 'utils/array.utils';
import { getTimeNow } from 'utils/date.utils';
import {
  createSearchParam,
  hasRequiredParams,
  parseSearchParams,
} from 'utils/searchParams';
import {
  useGetActivitiesConsistencyMutation,
  useGetActivitiesQuery,
} from './store';

const DEFAULT_PAGE_SIZE = 20;
// map of rivery table params to rivery api params
const queryKeysMap = {
  pageIndex: 'page',
  text: 'search',
  pageSize: 'items_per_page',
  sortBy: 'sort_by',
  sortOrder: 'sort_order',
};

export const toActivitiesParams = params =>
  Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [queryKeysMap[key] ?? key, value])
      .map(([key, value]) => [key, key === 'page' ? Number(value) + 1 : value])
      .filter(([_, value]) => value || value === 0),
  );

const requiredParams = [
  'start_time',
  'end_time',
  'account_id',
  'environment_id',
];

const useGetFullActivitiesData = data => {
  const [activitiesData, setActivitiesData] = useState(null);
  const [consistencyData, setConsistencyData] = useState(null);
  const [getConsistency, { data: consistency }] =
    useGetActivitiesConsistencyMutation();

  useEffect(() => {
    setActivitiesData(data?.items);
    setConsistencyData([]);
  }, [data?.items]);
  const now = getTimeNow();
  useEffect(() => {
    if (
      activitiesData &&
      activitiesData.length > 0 &&
      consistencyData?.length === 0
    ) {
      const rivers = activitiesData.map(
        ({ master_river_id }) => master_river_id,
      );
      getConsistency({ rivers, end_time: now?.end_time });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consistencyData]);

  useEffect(() => {
    if (consistency?.items) {
      setConsistencyData(consistency.items);
    }
  }, [consistency?.items]);

  useEffect(() => {
    if (activitiesData && Boolean(consistencyData?.length)) {
      const dataWithLastRuns = activitiesData.map(row => {
        const consistency = consistencyData.find(
          compare('river_id', row?.master_river_id),
        )?.last_runs;
        const last_runs = consistency?.length > 0 ? consistency : null;
        return {
          ...row,
          last_runs,
        };
      });
      setActivitiesData(dataWithLastRuns);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consistencyData]);

  return activitiesData;
};

export const useFetchData = paramsVal => {
  const { envId, activeAccountId } = useCore();
  const params = parseSearchParams();
  const paramsToSend = toActivitiesParams({
    ...params,
    environment_id: envId,
    account_id: activeAccountId,
    ...paramsVal,
    return_last_runs: false,
  });
  const { data, ...api } = useGetActivitiesQuery(paramsToSend, {
    skip:
      !hasRequiredParams(requiredParams, paramsToSend) ||
      !Boolean(paramsVal?.start_time),
  });
  const activitiesData = useGetFullActivitiesData(data);
  const failedRequest = data === undefined && api.status === 'fulfilled';
  return {
    data: activitiesData,
    total: data?.total_items || 0,
    totalShowing: data?.total_items,
    //We don't get the key total_pages from activities api so we have to calculate it.
    totalPages: data
      ? Math.ceil(data?.total_items / (params?.pageSize ?? DEFAULT_PAGE_SIZE))
      : 0,
    failedRequest,
    ...api,
  };
};

export function useFetchActivities(onParamChange = undefined) {
  const { envId, activeAccountId } = useCore();
  const { params, api } = useParams(onParamChange);
  const allParams = useMemo(
    () => ({
      ...params,
      environment_id: envId,
      account_id: activeAccountId,
    }),
    [activeAccountId, envId, params],
  );

  return { params: allParams as any, api };
}

const createDefaultParams = () => ({
  river_type: [],
  ...getTimeNow(),
  status: [],
  group_id: '',
  is_scheduled: null,
});

/**
 * hooks for setting/resetting url search params
 * @param onChange triggers onChange callback when setting a param / resetting
 */
export const useParams = (onChange = undefined) => {
  const { replace } = useHistory();
  const [params, setParams] = useState<any>(
    window.location.search.length
      ? { ...createDefaultParams(), ...parseSearchParams() }
      : createDefaultParams(),
  );

  const api = useMemo(
    () => ({
      setParam: (props: Record<string, any>) => {
        onChange && onChange();
        replace({
          search: createSearchParam({ ...params, ...props }, true),
        });
        setParams(state => ({ ...state, ...props }));
      },
      resetParams: () => {
        onChange && onChange();
        replace({
          search: createSearchParam(createDefaultParams()),
        });
        setParams(createDefaultParams());
      },
    }),
    [replace, params, onChange],
  );
  return {
    params,
    api,
  };
};
