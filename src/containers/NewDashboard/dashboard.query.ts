import { createRiveryApiV1 } from 'store/createRiveryApi';

export const TIMEZONES = {
  UTC: 'utc',
  LOCAL: 'local',
};

export const METRICS = {
  EXECUTIONS: 'executions',
  SUCCESS_RATE: 'success_rate',
  BDU: 'bdu',
};

export const VIEWS = {
  GENERAL: 'general',
  SOURCE: 'source',
};

export type Timezone = typeof TIMEZONES[keyof typeof TIMEZONES];
export type Metric = typeof METRICS[keyof typeof METRICS];
export type View = typeof VIEWS[keyof typeof VIEWS];

export interface DashboardDataRequest {
  environments?: string[];
  sources?: string[];
  start_time: number;
  end_time: number;
  metric: Metric;
  view: View;
  include_previous?: boolean;
}

export const dashboardApi = createRiveryApiV1
  .enhanceEndpoints({
    addTagTypes: ['Dashboard'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      dashboardData: builder.query<any, DashboardDataRequest>({
        queryFn: async (arg, { getState }, extraOptions, baseQuery) => {
          const state: any = getState();
          const { selectedAccountId } = state.core;
          const result = await baseQuery({
            url: `/accounts/${selectedAccountId}/dashboard`,
            method: 'POST',
            body: arg,
          });
          if (result.error) {
            return { error: result.error };
          }
          return { data: result.data };
        },
        keepUnusedDataFor: 0,
      }),
      dashboardSourcesList: builder.query<{ sources: string[] }, string>({
        query: accountId => ({ url: `accounts/${accountId}/sources_list` }),
      }),
    }),
  });

export const { useDashboardDataQuery, useDashboardSourcesListQuery } =
  dashboardApi;
