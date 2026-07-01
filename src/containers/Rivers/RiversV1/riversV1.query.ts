import { DateType } from 'api/types';
import { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';
import {
  createSearchParam,
  parseSearchParams,
  stringifyParams,
} from 'utils/searchParams';
import { getDataV1 } from 'api/api.proxy';

type IRiverStatus = 'active' | 'disabled';

interface IRiverItem {
  name: string;
  river_status: IRiverStatus;
  group_name: string;
  group_id: string;
  river_schedulers: string[];
  datasource_id: string;
  last_user_name_modified: string;
  river_cross_id: string;
  last_updated_at: DateType;
  description: string;
  is_api_v2: true;
}

interface IRiversData {
  next_page: string;
  previous_page: string;
  page: number;
  current_page_size: number;
  total_items: number;
  account_id: string;
  environment_id: string;
  items: IRiverItem[];
}

export const useRiversGridParams = (onChange = undefined) => {
  const { replace } = useHistory();
  const [params, setParams] = useState<any>({ ...parseSearchParams() });
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
          search: null,
        });
        setParams({ ...parseSearchParams() });
      },
    }),
    [replace, params, onChange],
  );
  return {
    params,
    api,
  };
};

// UTILS
const stringifyUrlParams = (url, params) => `${url}?${stringifyParams(params)}`;
export const getHasRivers = (account_id: string, params = {}) => {
  const query = stringifyParams(params);
  const url = query
    ? `accounts/${account_id}/has_rivers?${query}`
    : `accounts/${account_id}/has_rivers`;
  return getDataV1(false, url);
};
export const getSourcesList = (account_id: string) => {
  return getDataV1(false, `accounts/${account_id}/sources_list`);
};
const createRiversQuery =
  () =>
  ({ ...params }) => {
    return {
      url: stringifyUrlParams('/rivers_search', params),
    };
  };

export const riversApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['Rivers'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getRivers: builder.query<IRiversData, null>({
        providesTags: ['Rivers'],
        query: createRiversQuery(),
      }),
      deleteRiver: builder.mutation<any, { river_cross_id: string }>({
        query: ({ river_cross_id }) => ({
          url: `/rivers/${river_cross_id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Rivers'],
      }),
      copyRiver: builder.mutation<any, { river_cross_id: string }>({
        query: ({ river_cross_id }) => ({
          url: `/rivers/${river_cross_id}/copy`,
          method: 'POST',
        }),
        invalidatesTags: ['Rivers'],
      }),
    }),
  });

export const {
  useGetRiversQuery,
  useDeleteRiverMutation,
  useCopyRiverMutation,
} = riversApi;

export const extractErrorV1 = error => error?.data?.detail;

export interface HasRiversResponse {
  has_rivers: boolean;
}
