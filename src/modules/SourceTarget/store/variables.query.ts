import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';
import { IRiverV1, IVariablesV1, IVariableV1 } from './types';

interface IVariablesInput {
  items: IVariableV1[];
  crossId: string;
}

export const riverVariablesApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['RiverVariables'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getRiverVariables: builder.query<IRiverV1, string>({
        providesTags: ['RiverVariables'],
        query: crossId => `rivers/${crossId}/variables`,
      }),
      updateRiverVariables: builder.mutation<IVariablesV1, IVariablesInput>({
        query: ({ items, crossId }) => ({
          url: `rivers/${crossId}/variables`,
          method: 'PUT',
          body: items,
        }),
        invalidatesTags: ['RiverVariables'],
      }),
    }),
  });

export const { useGetRiverVariablesQuery, useUpdateRiverVariablesMutation } =
  riverVariablesApi;
