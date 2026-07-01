import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API } from 'api';
import { MetadataType } from 'api/endpoints/metadata.api';
import { IRiver, TargetTypesV1 } from 'api/types';
import { selectSelectedEnvVariables } from 'store/environments/environments.selectors';
import { createEmptyFZRiver } from 'store/river';
import {
  CallType,
  getRiverForMetadataCall,
} from 'store/river/hooks/useRiverForMetadataCall';
import {
  selectSelectedRiver,
  selectSelectedRiverVariables,
} from 'store/river/river.selectors';
import { getId, getOId } from 'utils/api.sanitizer';
import { Metadata } from './metadata.types';
export const REDUCER_KEY = 'metadata';

const POLL_INTERVAL = 2000;

type MetadataQuery = {
  id: string;
  river?: IRiver | any;
  step?: string;
  type: MetadataType;
  callType: CallType;
  callFields?: any;
  excludeVariables?: boolean;
  innerId?: number;
};

export const metadataApi = createApi({
  reducerPath: REDUCER_KEY,
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/pull',
  }),
  // tagTypes: ['Metadata'],

  serializeQueryArgs: ({ queryArgs, endpointName }) => {
    return `${endpointName}(${(queryArgs as any).id})`;
  },
  endpoints: builder => {
    return {
      getMetadata: builder.query<Metadata, MetadataQuery>({
        queryFn: async (query, { getState }) => {
          if (!query.id) {
            return {
              error: {
                status: 400,
                message: 'No source connection is selected',
                data: undefined,
              },
            };
          }
          const state = getState();
          let river = query.river || selectSelectedRiver(state as never);
          const {
            step,
            type,
            callFields,
            callType,
            excludeVariables = false,
          } = query;
          const gcsConnection = {
            connection_id: { $oid: callFields?.connectionCrossId },
            target_type: TargetTypesV1.GOOGLE_CLOUD_STORAGE.toLowerCase(),
          };
          if (callType === CallType.CONNECTION) {
            const { connectionCrossId, dsId, connectionType } = callFields;
            if (!connectionType || !dsId) {
              return {
                error: {
                  status: 400,
                  message: 'missing required property',
                  data: undefined,
                },
              };
            }
            river = createEmptyFZRiver(connectionCrossId, dsId, connectionType);
          } else if (callType === CallType.CALL_FIELDS) {
            if (!callFields) {
              return {
                error: {
                  status: 400,
                  message: 'missing required property',
                  data: undefined,
                },
              };
            }
          } else if (!river) {
            return {
              error: {
                status: 400,
                message: 'missing required property',
                data: undefined,
              },
            };
          }

          const envVars = selectSelectedEnvVariables(state);
          const riverVars = selectSelectedRiverVariables(state as never);
          const data = getRiverForMetadataCall(
            river,
            callType,
            callFields,
            step,
          );
          const pollingHandle = await API.metadata.getMetadata(
            callFields?.connectionType ===
              TargetTypesV1.GOOGLE_CLOUD_STORAGE.toLowerCase() &&
              type === MetadataType.BUCKETS
              ? gcsConnection
              : data,
            type,
          );
          let pollingStatus = ['R', 'W'].includes(pollingHandle.request_status)
            ? await API.metadata.pollMetadata(getOId(pollingHandle._id))
            : pollingHandle;
          while (['R', 'W'].includes(pollingStatus.request_status)) {
            const {
              _id: { $oid },
            } = pollingStatus;
            pollingStatus = await new Promise(resolve =>
              setTimeout(
                resolve,
                POLL_INTERVAL,
                API.metadata.pollMetadata($oid),
              ),
            );
          }
          if (pollingStatus.request_status === 'D') {
            const metadata = pollingStatus.results as any[];
            const variablesNames: string[] = Array.from(
              new Set(
                [envVars, riverVars]
                  .filter(Boolean)
                  .map(Object.keys)
                  .flat()
                  .map(varName => `{${varName}}`),
              ),
            );

            const metadataWithVars = (metadata ?? []).concat(
              excludeVariables ? [] : variablesNames,
            );

            const data = metadataWithVars.map(value => ({
              value,
              label: value,
            }));
            return { data };
          } else {
            const message: string = pollingStatus.error_msg;
            return {
              error: {
                status: 400,
                message,
                pullRequestId: getId(pollingStatus),
                data: undefined,
              },
            };
          }
        },
      }),
    };
  },
});

export const { useGetMetadataQuery } = metadataApi;
