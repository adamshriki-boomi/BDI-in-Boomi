import { createRiveryApiV1 } from 'store/createRiveryApi';
import { ColumnsResponse } from '../components/SchemaEditor/SchemaTables/TableSettings/Mapping/types';
import { ReportsResponse } from './schemas.types';

const PREDEFINED_REPORTS = '/predefined_metadata';

interface Pages {
  nextPage?: string;
  prevPage?: string;
  include_ids?: string;
}

export interface getReportsArgs extends Pages {
  datasource_id: string;
  report_name?: string;
}

export interface getColumnsArgs extends getReportsArgs {
  report: string;
  column_name?: string;
  items_per_page?: number;
}

export const predefinedReportsApi = createRiveryApiV1
  .enhanceEndpoints({
    addTagTypes: ['Reports', 'Columns'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getReports: builder.query<ReportsResponse, getReportsArgs>({
        keepUnusedDataFor: 0,
        providesTags: ['Reports'],
        query: ({
          datasource_id,
          report_name = '',
          nextPage: next_page_id = undefined,
          prevPage: previous_page_id = undefined,
          include_ids = undefined,
        }) => ({
          url: `${PREDEFINED_REPORTS}/tables`,
          params: {
            datasource_id,
            report_name,
            next_page_id,
            previous_page_id,
            include_ids,
          },
        }),
      }),
      getPredefinedColumns: builder.query<ColumnsResponse, getColumnsArgs>({
        keepUnusedDataFor: 0,
        providesTags: ['Columns'],
        query: ({
          datasource_id,
          report,
          column_name = undefined,
          nextPage: next_page_id = undefined,
          prevPage: previous_page_id = undefined,
          items_per_page = 500,
        }) => ({
          url: `${PREDEFINED_REPORTS}/columns`,
          params: {
            datasource_id,
            report,
            column_name,
            next_page_id,
            previous_page_id,
            items_per_page,
          },
        }),
      }),
      getPredefinedMetadata: builder.query<any, any>({
        keepUnusedDataFor: 0,
        providesTags: ['Columns'],
        query: ({ datasource_id, report_id }) => ({
          url: `${PREDEFINED_REPORTS}/metadata`,
          params: {
            datasource_id,
            report_id,
          },
        }),
      }),
    }),
  });

export const {
  useGetReportsQuery,
  useGetPredefinedColumnsQuery,
  useGetPredefinedMetadataQuery,
} = predefinedReportsApi;
