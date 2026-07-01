import { OID } from 'api/types';
import { calculateTime } from 'utils/date.utils';
import { createRiveryApi } from 'store/createRiveryApi';
import { IDeploymentSettings } from '../EnvironmentsSettings/settings.query';

export enum ViewTypes {
  PACKAGES = 'packages',
  ACTIVITY = 'activity',
}

const ENDPOINT = 'package';
const PACKAGE_ACTIVITIES = 'deployment/activities/package';

interface IPackageData {
  env_id_trg: OID;
  account: OID;
  is_prepared: boolean;
  deployment_settings: IDeploymentSettings;
  entities: {
    connections: Record<string, boolean>;
    river_groups: Record<string, boolean>;
    rivers: Record<string, boolean>;
    variables: Record<string, boolean>;
    templates: Record<string, string>;
  };
  entities_total: {
    connections: number;
    river_groups: number;
    rivers: number;
    variables: number;
  };
  env_id_src: OID;
  env_src_name: string;
  env_trg_name: string;
  excluded_entities: Record<any, any>;
  updated_by: OID;
  package_name: string;
  updated_by_name: string;
  is_deployment_lock: boolean;
  updated_at: { $date: number };
  created_at: { $date: number };
  _id: OID;
}

interface IPackageActivityData {
  deployment_settings: IDeploymentSettings;
  package_name: string;
  run_id: string;
  modified_at_epoch: number;
  package_id: string;
  env_trg_name: string;
  is_hidden: boolean;
  deployed_by_name: string;
  deployed_by: string;
  env_id_src: string;
  template_type: string;
  host_src: string;
  delete_in: number;
  host_trg: string;
  deployment_status: string;
  env_id_trg: string;
  insert_timestamp: { $date: number };
  finished_deploy_at: { $date: number };
  env_src_name: string;
  deployed_at: { $date: number };
  account: string;
  entities_total_deployed: Record<string, number>;
  insert_epoch_time: number;
  modified_at: { $date: number };
  entities_total: Record<string, number>;
  account_trg: string;
  account_src: string;
  deployment_id: string;
  revert_status: string;
}

export const packagesApi = createRiveryApi
  .enhanceEndpoints({
    addTagTypes: ['Packages', 'Activities'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getPackages: builder.query<IPackageData[], null>({
        providesTags: ['Packages'],
        query: () => ({
          url: `${ENDPOINT}/list`,
        }),
      }),
      getActivities: builder.query<
        IPackageActivityData[],
        { package_id: string; dateRange } | null
      >({
        providesTags: ['Activities'],
        query: ({ package_id, dateRange }) => {
          const range = calculateTime('D', 7);
          let startDate = range.event_start_time;
          let endDate = range.event_end_time;
          if ((dateRange && dateRange.label === 'Last 7 Days') || !dateRange) {
            return {
              url: package_id
                ? `${PACKAGE_ACTIVITIES}?package_id=${package_id}`
                : PACKAGE_ACTIVITIES,
            };
          }
          if (dateRange && dateRange.label !== 'Last 7 Days') {
            startDate = dateRange.time.event_start_time;
            endDate = dateRange.time.event_end_time;
          }
          return {
            url: package_id
              ? `${PACKAGE_ACTIVITIES}?package_id=${package_id}&timeRange=custom&endDate=${endDate}&startDate=${startDate}`
              : `${PACKAGE_ACTIVITIES}?timeRange=custom&endDate=${endDate}&startDate=${startDate}`,
          };
        },
      }),
      modifyPackage: builder.mutation<
        IPackageData,
        {
          package_id?: string;
          package_definition: any;
          methodType: string;
        }
      >({
        query: ({ package_definition, package_id = null, methodType }) => ({
          url: `${ENDPOINT}/modify`,
          method: methodType,
          body: package_id
            ? { package_id, package_definition }
            : { package_definition },
        }),
        invalidatesTags: ['Packages'],
      }),
      preparePackage: builder.mutation<any, { package_id: OID }>({
        query: package_id => ({
          url: 'deployment/prepare',
          method: 'PUT',
          body: { package_id },
        }),
      }),
      deletePackage: builder.mutation<any, string>({
        query: package_id => ({
          url: `${ENDPOINT}/modify?package_id=${package_id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Packages'],
      }),
      deployPackage: builder.mutation<any, string>({
        query: package_id => ({
          url: 'deployment/deploy',
          method: 'PUT',
          body: { package_id },
        }),
        invalidatesTags: ['Activities'],
      }),
      revertPackage: builder.mutation<any, string>({
        query: deployment_id => ({
          url: 'deployment/revert',
          method: 'PUT',
          body: { deployment_id },
        }),
        invalidatesTags: ['Activities'],
      }),
    }),
  });

export const {
  useGetPackagesQuery,
  useGetActivitiesQuery,
  useModifyPackageMutation,
  usePreparePackageMutation,
  useDeletePackageMutation,
  useDeployPackageMutation,
  useRevertPackageMutation,
} = packagesApi;
