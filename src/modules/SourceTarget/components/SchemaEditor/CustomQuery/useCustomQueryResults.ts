import { useCallback, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { getId } from 'utils/api.sanitizer';
import { pollPullRequest } from './pollPullRequest';

export interface CustomQueryResultsState {
  results: Record<string, any>[];
  compiled: string;
  rows: number;
  columns: number;
  limit: number;
  errorMessage: string;
  pullRequestId: string;
}

const DEFAULT_QUERY_LIMIT = 1000;

const initialState: CustomQueryResultsState = {
  results: [],
  compiled: '',
  rows: 0,
  columns: 0,
  limit: DEFAULT_QUERY_LIMIT,
  errorMessage: '',
  pullRequestId: '',
};

/**
 * Hook to run custom SQL queries and get results.
 * Uses the pull_requests API with task: 'get_results' and task_type: 'source'.
 */
export function useCustomQueryResults() {
  const formApi = useFormContext();

  const { field: connectionIdField } = useController({
    name: 'river.properties.source.connection_id',
    control: formApi.control,
  });

  const { field: dataSourceIdField } = useController({
    name: 'river.properties.source.name',
    control: formApi.control,
  });

  const [loading, setLoading] = useState(false);
  const [queryResults, setQueryResults] =
    useState<CustomQueryResultsState>(initialState);

  const runQuery = useCallback(
    async (query: string) => {
      if (!query?.trim()) {
        setQueryResults(prev => ({
          ...prev,
          errorMessage: 'Query cannot be empty',
        }));
        return;
      }

      // Reset previous results and start loading
      setQueryResults(initialState);
      setLoading(true);

      try {
        const pollingStatus = await pollPullRequest({
          task_type: 'source',
          task: 'get_results',
          datasource_id: dataSourceIdField?.value,
          pull_request_inputs: {
            connection_id: connectionIdField?.value,
            query,
          },
        });

        if (pollingStatus.status === 'D') {
          // Results are directly in the poll response
          const responseData = pollingStatus.result;

          // Stringify objects inside the results (for proper display)
          const results =
            responseData?.results?.map(row => {
              const keys = Object.keys(row);
              for (let key in keys) {
                if (['object', 'boolean'].includes(typeof row[keys[key]])) {
                  row[keys[key]] = JSON.stringify(row[keys[key]]);
                }
              }
              return row;
            }) || [];

          setQueryResults({
            results,
            compiled: responseData?.compiled_query || '',
            rows: results.length,
            columns: results.length > 0 ? Object.keys(results[0]).length : 0,
            limit: responseData?.query_limit || DEFAULT_QUERY_LIMIT,
            errorMessage: pollingStatus?.error_message || '',
            pullRequestId:
              getId(pollingStatus) || pollingStatus?.operation_id || '',
          });
        } else {
          setQueryResults(prev => ({
            ...prev,
            errorMessage: pollingStatus.error_message || 'Error running query',
          }));
        }
      } catch (error: any) {
        setQueryResults(prev => ({
          ...prev,
          errorMessage:
            error?.message || 'An error occurred while running the query',
        }));
      } finally {
        setLoading(false);
      }
    },
    [connectionIdField?.value, dataSourceIdField?.value],
  );

  const hasResults = queryResults.results.length > 0;
  const hasError = Boolean(queryResults.errorMessage);

  return {
    runQuery,
    loading,
    hasResults,
    hasError,
    ...queryResults,
  };
}
