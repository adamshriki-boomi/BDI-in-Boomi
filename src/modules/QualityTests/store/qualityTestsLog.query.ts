import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { createRiveryApi } from 'store/createRiveryApi';
import { IQualityTestLog } from './qualityTestsLog.types';

const getEndpoint = (runId: string, activity: string) =>
  `activities/${activity}/${runId}/data_quality_tests_log`;

const createEndpoint = (
  activity: string,
  builder: EndpointBuilder<any, any, any>,
) => {
  return builder.query<IQualityTestLog[], string>({
    providesTags: ['QualityTestLog'],
    query: id => ({
      url: getEndpoint(id, activity),
    }),
  });
};

export const qualityTestsLogApi = createRiveryApi
  .enhanceEndpoints({
    addTagTypes: ['QualityTestLog'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getTestLogsByRunId: createEndpoint('runs', builder),
      getTestLogsByRiverId: createEndpoint('rivers', builder),
    }),
  });

export const { useGetTestLogsByRunIdQuery, useGetTestLogsByRiverIdQuery } =
  qualityTestsLogApi;
