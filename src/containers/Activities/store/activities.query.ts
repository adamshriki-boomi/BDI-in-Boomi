import {
  ActivitiesPayload,
  ListAllPayload,
} from 'api/endpoints/activities.api';
import { useCallback } from 'react';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';
import { stringifyParams } from 'utils/searchParams';
import { dispatchFilterIdUpdate, resolveFilterId } from './activities.reducer';
import {
  ActivitiesConsistencResponse,
  ActivitiesResponse,
  ActivitiesStatsResponse,
  ActivitiesTargetsPayload,
  ActivitiesTargetsResponse,
  ActivityRiverRunsResponse,
  ICollectionResponse,
  IDateRange,
  IRiverCreds,
  ISubRiver,
} from './activities.types';
import {
  IRiverActivityRun,
  IRunStepsResponse,
  IRunTasksLog,
  ITablesActivityResponse,
  RiverActivitiesRun,
  RiverActivitiesRunResponse,
} from './riverActivitiesRun.types';

// UTILS
const stringifyUrlParams = (url, params) => `${url}?${stringifyParams(params)}`;

export const extractItems = (response: ICollectionResponse<any>) =>
  response?.items || [];

const createRiversQuery =
  (suffixUrl: string) =>
  ({ riverId, ...params }) => {
    return {
      url: stringifyUrlParams(`rivers/${riverId}/${suffixUrl}`, params),
    };
  };
const createRunsQuery =
  (suffixUrl: string) =>
  ({ riverId, runId }) =>
    suffixUrl
      ? {
          url: `rivers/${riverId}/runs/${runId}/${suffixUrl}`,
        }
      : { url: `rivers/${riverId}/runs/${runId}` };

const ACTIVITIES_TAGS = ['Activities'];
// API QUERY
export const activitiesApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ACTIVITIES_TAGS,
  })
  .injectEndpoints({
    endpoints: builder => ({
      getActivities: builder.query<ActivitiesResponse, ListAllPayload>({
        providesTags: ACTIVITIES_TAGS,
        queryFn: async (params, api, extraOptions, baseQuery) => {
          try {
            const response = await baseQuery(
              stringifyUrlParams('/activities', {
                ...params,
                ...resolveFilterId(api.getState()),
              }),
            );
            const data = response?.data as ActivitiesResponse;
            dispatchFilterIdUpdate(api, data?.cache_context_id);
            return { data } as any;
          } catch (error) {
            return { error };
          }
        },
      }),
      getActivitiesStats: builder.query<any, ActivitiesPayload>({
        providesTags: ACTIVITIES_TAGS,
        query: (params: any): any => ({
          url: stringifyUrlParams('/activities_statistics', params),
        }),
      }),
      getActivityStats: builder.query<
        ActivitiesStatsResponse,
        IRiverCreds & IDateRange
      >({
        providesTags: ACTIVITIES_TAGS,
        query: createRiversQuery('activities_statistics'),
      }),
      getRiverActivitiesRun: builder.query<
        RiverActivitiesRunResponse,
        RiverActivitiesRun
      >({
        providesTags: ACTIVITIES_TAGS,
        query: createRiversQuery('runs'),
      }),
      getRiverActivitiesSingleRun: builder.query<IRiverActivityRun, any>({
        query: createRunsQuery(''),
      }),
      getActivityRunsLog: builder.query<
        IRunTasksLog,
        IRiverCreds & { runId: string; start_time?: string; end_time?: string }
      >({
        query: createRunsQuery('tasks'),
        // transformResponse: (response: IRunTasksLog) => extractItems(response),
      }),
      getActivityRiverRuns: builder.query<
        ActivityRiverRunsResponse,
        IRiverCreds & any
      >({
        providesTags: ACTIVITIES_TAGS,
        query: createRiversQuery('activities_run_groups'),
      }),
      getSubRivers: builder.query<
        ISubRiver[],
        IRiverCreds & Partial<IDateRange>
      >({
        query: createRiversQuery('activities_sub_rivers'),
        transformResponse: extractItems,
      }),
      getActivitiesTargets: builder.query<
        ActivitiesTargetsResponse,
        ActivitiesTargetsPayload
      >({
        providesTags: ACTIVITIES_TAGS,
        query: createRiversQuery('activities_targets'),
      }),
      getActivitiesConsistency: builder.mutation<
        ActivitiesConsistencResponse,
        { rivers: string[]; end_time: number }
      >({
        query: ({ rivers, end_time }) => ({
          url: '/activities_graph',
          method: 'POST',
          body: { river_ids: rivers, end_time },
        }),
      }),
      getLogicRunSteps: builder.query<
        IRunStepsResponse,
        {
          riverId: string;
          runId: string;
          start_time?: string;
          end_time?: string;
        }
      >({
        query: ({ riverId, runId }) => ({
          url: `rivers/${riverId}/runs/${runId}/logic_steps`,
        }),
        transformResponse: (response: any) => response?.steps ?? [],
      }),
      getActivitiesTables: builder.query<
        ITablesActivityResponse,
        { riverId: string; runGroupId: string }
      >({
        query: ({ riverId, runGroupId, ...params }) => ({
          url: stringifyUrlParams(
            `rivers/${riverId}/activities_run_groups/${runGroupId}`,
            params,
          ),
        }),
      }),
    }),
  });

export const {
  useGetActivitiesQuery,
  useGetActivitiesStatsQuery,
  useGetActivityStatsQuery,
  useLazyGetActivityStatsQuery,
  useGetRiverActivitiesRunQuery,
  useGetRiverActivitiesSingleRunQuery,
  useGetActivityRunsLogQuery,
  useGetActivityRiverRunsQuery,
  useGetSubRiversQuery,
  useGetActivitiesTargetsQuery,
  useGetActivitiesConsistencyMutation,
  useGetLogicRunStepsQuery,
  useGetActivitiesTablesQuery,
} = activitiesApi;

export const useActivittyWeekly = (data: IRiverCreds & IDateRange) => {
  const [trigger, result] = useLazyGetActivityStatsQuery();
  const getStats = useCallback(async () => {
    const response = await trigger({
      ...data,
    });
    return response.data;
  }, [data, trigger]);

  return { getStats, ...result };
};
