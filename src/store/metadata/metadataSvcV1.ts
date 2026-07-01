import { API } from 'api';
import { MetadataType } from 'api/endpoints/metadata.api';
import { SourceTypes } from 'api/types';
import { interfaceParamsToSupportBoolean } from 'containers/BluePrints/helpers';
import Cookies from 'js-cookie';
import { useCallback } from 'react';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';
import { Metadata, MetadataQuery } from './metadata.types';
export const REDUCER_KEY = 'metadata';

const POLL_INTERVAL = 2000;

const cacheCookieName = query => {
  let cookiePath = `${query.task}-${query.pull_request_inputs.connection_id}`;
  if (query.pull_request_inputs.database_name) {
    cookiePath = cookiePath.concat(
      `-${query.pull_request_inputs.database_name}`,
    );
  }
  if (query.pull_request_inputs.repository_id) {
    cookiePath = cookiePath.concat(
      `-${query.pull_request_inputs.repository_id}`,
    );
  }
  return cookiePath;
};

const extractData = (
  pollingStatus,
  shouldUseCachedData = false,
  query = null,
  pollingHandle = null,
) => {
  const metadata = pollingStatus.result as any[];
  const data = metadata.map(value => ({
    value,
    label: value,
  }));
  // If we have retrieved data, we want to be able to access it for the next 7 daysToWeeks, so we keep the operation id as a cookie
  if (data?.length > 0 && shouldUseCachedData) {
    Cookies.set(cacheCookieName(query), pollingHandle.operation_id, {
      expires: 45,
    });
  }
  return { data };
};

export const metadataApiV1 = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['Metadata'],
  })
  .injectEndpoints({
    endpoints: builder => {
      return {
        getMetadataV1: builder.query<Metadata, MetadataQuery>({
          queryFn: async query => {
            const shouldUseCachedData = [
              `get_${MetadataType.DATABASES}`,
              `get_${MetadataType.SCHEMAS}`,
              `get_${MetadataType.BUCKETS}`,
              `get_${MetadataType.CATALOGS}`,
              `get_${MetadataType.DATASETS}`,
              `get_${MetadataType.CONTAINERS}`,
              `get_${MetadataType.KNOWLEDGE_BASES}`,
              `get_${MetadataType.REPOSITORIES}`,
            ].includes(query.task);
            if (shouldUseCachedData) {
              const cachedOperationId = Cookies.get(cacheCookieName(query));
              if (cachedOperationId && !query?.poll) {
                const pollingStatus = await API.metadata.pollMetadataV1(
                  cachedOperationId,
                );
                if (pollingStatus?.status === 'D') {
                  const data = extractData(pollingStatus);
                  if (data) {
                    return data;
                  }
                }
              }
            }
            const pollingHandle = await API.metadata.getMetadataV1({
              ...query,
            });
            let pollingStatus = ['R', 'W'].includes(pollingHandle.status)
              ? await API.metadata.pollMetadataV1(pollingHandle.operation_id)
              : pollingHandle;
            while (['R', 'W'].includes(pollingStatus.status)) {
              const { operation_id } = pollingStatus;
              pollingStatus = await new Promise(resolve =>
                setTimeout(
                  resolve,
                  POLL_INTERVAL,
                  API.metadata.pollMetadataV1(operation_id),
                ),
              );
            }
            if (pollingStatus.status === 'D') {
              const error_message: string = pollingStatus.error_message;
              if (
                query.task === 'get_db_metadata' ||
                query?.datasource_id === 'blueprint'
              ) {
                return { data: pollingStatus.result, error_message };
              } else {
                const data = extractData(
                  pollingStatus,
                  shouldUseCachedData,
                  query,
                  pollingHandle,
                );
                return data;
              }
            } else {
              const message: string = pollingStatus.error_message;
              return {
                error: {
                  status: 400,
                  message,
                  data: [],
                },
              };
            }
          },
        }),
      };
    },
  });

export const { useLazyGetMetadataV1Query } = metadataApiV1;

export const useMetadataPoller = (metadataQuery: MetadataQuery) => {
  const [trigger, result] = useLazyGetMetadataV1Query();
  const isBigquery = metadataQuery.datasource_id === SourceTypes.BIGQUERY;
  const isBlueprint = metadataQuery.datasource_id === SourceTypes.BLUEPRINT;
  const startPolling = useCallback(
    async (
      schemaName = null,
      tableName = null,
      connection_id = metadataQuery.pull_request_inputs?.connection_id,
      blueprintId = metadataQuery.pull_request_inputs?.recipe_id,
      blueprintInputs: {
        recipe_id?: string;
        date_range?: Record<string, any>;
        interface_parameters?: Record<string, any>;
        report_name?: string;
      } = {
        recipe_id: blueprintId,
        date_range: metadataQuery.pull_request_inputs?.date_range,
        interface_parameters:
          metadataQuery.pull_request_inputs?.interface_parameters,
      },
    ) => {
      const dataStructureKey = isBigquery ? 'datasets' : 'schemas';
      const hasSelectedSchema = schemaName && schemaName !== 'empty_state';
      const {
        interface_parameters,
        date_range = null,
        recipe_id = blueprintId,
        report_name = null,
      } = blueprintInputs;

      // Deep clone the source array to ensure we dont break any references
      const sourceArray = interfaceParamsToSupportBoolean(
        interface_parameters?.source
          ? JSON.parse(JSON.stringify(interface_parameters.source))
          : [],
      );

      // Create a completely new pull_request_inputs object to handle immutables
      const pull_request_inputs = {
        ...(isBlueprint && {
          recipe_id,
          interface_parameters: {
            source: sourceArray,
          },
          date_range: date_range
            ? JSON.parse(JSON.stringify(date_range))
            : null,
          ...(report_name && { report_name }),
        }),
        //Deep cloning the pull_request_inputs to ensure immutability
        ...(metadataQuery.pull_request_inputs
          ? JSON.parse(JSON.stringify(metadataQuery.pull_request_inputs))
          : {}),
        ...(hasSelectedSchema && {
          [dataStructureKey]: [schemaName],
        }),
        connection_id,
      };
      const response = await trigger({
        ...metadataQuery,
        pull_request_inputs,
        ...(tableName && { table_name: tableName }),
      });
      return response;
    },
    [metadataQuery, isBigquery, isBlueprint, trigger],
  );

  return { startPolling, ...result };
};
