import { ITeam } from 'api/types';
import { createRiveryApiV1 } from 'store/createRiveryApi';
import { stringifyParams } from 'utils/searchParams';
interface TeamsResponse {
  next_page: string;
  previous_page: string;
  page: number;
  current_page_size: number;
  total_items: number;
  account_id: string;
  environment_id: string;
  items: ITeam[];
}

interface ITeamsUpdate {
  team_ids: string[];
  body: Partial<ITeam>;
  account: string;
}

const stringifyUrlParams = (url, params) => `${url}?${stringifyParams(params)}`;
const createTeamsQuery =
  () =>
  ({ account_id, ...params }) => {
    return {
      url: stringifyUrlParams(`accounts/${account_id}/teams`, {
        ...params,
      }),
    };
  };

export const teamsActionsApi = createRiveryApiV1
  .enhanceEndpoints({
    addTagTypes: ['Teams'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getTeams: builder.query<TeamsResponse, null>({
        providesTags: ['Teams'],
        query: createTeamsQuery(),
      }),
      // getGroups: builder.query<
      //   TeamsResponse,
      //   { account_id; is_imported; remote_display_name }
      // >({
      //   query: ({ account_id, is_imported, remote_display_name }) => {
      //     const url = `accounts/${account_id}/teams?remote_display_name=${remote_display_name}`;
      //     return {
      //       url:
      //         is_imported !== null
      //           ? url.concat(`&is_imported=${is_imported}`)
      //           : url,
      //     };
      //   },
      // }),
      getSingleTeam: builder.query<ITeam, { account_id; group_id }>({
        providesTags: ['Teams'],
        query: ({ account_id, group_id }) => ({
          url: `accounts/${account_id}/teams/${group_id}`,
        }),
      }),
      updateTeam: builder.mutation<ITeam, ITeam>({
        query: ({ account, _id, ...body }) => ({
          url: `accounts/${account}/teams/${_id}`,
          method: 'PATCH',
          body: { ...body },
        }),
        invalidatesTags: ['Teams'],
      }),
      updateMultipleTeams: builder.mutation<ITeam, ITeamsUpdate>({
        query: ({ account, team_ids, body }) => ({
          url: `accounts/${account}/teams`,
          method: 'PATCH',
          body: { body, team_ids },
        }),
        invalidatesTags: ['Teams'],
      }),
    }),
  });

export const {
  useGetTeamsQuery,
  useGetSingleTeamQuery,
  useUpdateTeamMutation,
  useUpdateMultipleTeamsMutation,
} = teamsActionsApi;
