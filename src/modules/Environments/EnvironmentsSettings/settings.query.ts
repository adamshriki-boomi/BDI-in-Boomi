import { createRiveryApi } from 'store/createRiveryApi';

const ENDPOINT = 'package';

export interface IDeploymentSettings {
  add_group_related_rivers: boolean;
  add_related_connections: boolean;
  add_related_connections_from_connections: boolean;
  add_related_dataframes: boolean;
  add_related_groups: boolean;
  add_related_rivers: boolean;
  add_templates_group_related_rivers: boolean;
  add_variable_values: boolean;
  copy_connections_credentials: boolean;
  notifications: Record<'on_deployment', { enabled: boolean; email: string }>;
  only_deploy_new_connections: boolean;
  only_deploy_new_rivers: boolean;
  only_deploy_new_variables: boolean;
  overwrite_dynamic_parameters: boolean;
  templates_publish_email_list: string;
}

export const environmentsSettingsApi = createRiveryApi
  .enhanceEndpoints({
    addTagTypes: ['EnvironmentsSettings'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getSettings: builder.query<IDeploymentSettings, string>({
        providesTags: ['EnvironmentsSettings'],
        query: () => `${ENDPOINT}/default_settings`,
      }),
      setSettings: builder.mutation({
        query: deploymentSettings => ({
          url: `${ENDPOINT}/default_settings`,
          method: 'PATCH',
          body: deploymentSettings,
        }),
        invalidatesTags: ['EnvironmentsSettings'],
      }),
    }),
  });

export const { useGetSettingsQuery, useSetSettingsMutation } =
  environmentsSettingsApi;
