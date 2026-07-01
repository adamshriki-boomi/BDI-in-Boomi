import { useCallback } from 'react';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';

interface ICDCConfig {
  config: {
    last_updated?: string;
    datasource_type?: string;
    binlog_file?: string;
    binlog_position?: string;
    gtid?: string;
  };
}

interface IPostConfig extends ICDCConfig {
  crossId: string;
}

export const cdcConfigApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['CDCConfig'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getConfig: builder.query<ICDCConfig, string>({
        query: crossId => `rivers/${crossId}/cdc_config`,
      }),
      postConfig: builder.mutation<ICDCConfig, IPostConfig>({
        query: ({ crossId, config }) => ({
          url: `rivers/${crossId}/cdc_config`,
          method: 'POST',
          body: { config },
        }),
      }),
      deleteConfig: builder.mutation<ICDCConfig, string>({
        query: crossId => ({
          url: `rivers/${crossId}/cdc_config`,
          method: 'DELETE',
        }),
      }),
    }),
  });

export const {
  useLazyGetConfigQuery,
  usePostConfigMutation,
  useDeleteConfigMutation,
} = cdcConfigApi;

export const useGetConfigData = (crossId: string) => {
  const [trigger, result] = useLazyGetConfigQuery();
  const getConfig = useCallback(async () => {
    const response = await trigger(crossId);
    return response.data;
  }, [crossId, trigger]);

  return { getConfig, ...result };
};
