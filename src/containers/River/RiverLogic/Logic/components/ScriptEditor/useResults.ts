import { API } from 'api';
import { MetadataType } from 'api/endpoints/metadata.api';
import { OID, RunStatus } from 'api/types';
import { useAsyncMetadata } from 'containers/River/hooks/useAsyncMetadata';
import { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { useRiver } from 'store/river';
import {
  CallType,
  getRiverForMetadataCall,
} from 'store/river/hooks/useRiverForMetadataCall';
import { getId } from 'utils/api.sanitizer';

type useResultsConfig = {
  /**
   * indicates when error should be cleaned
   */
  clearErrorDeps: boolean;
};
export const useResults = (
  hash: string,
  { clearErrorDeps }: useResultsConfig,
) => {
  const { findStep, selectedRiver } = useRiver();
  const fetchResults = useAsyncMetadata({
    type: MetadataType.RESULTS,
    callType: CallType.SQL_RESULTS,
    withoutTransforms: true,
  });
  const [state, runResults] = useAsyncFn(
    async (sql_query: string) => {
      const step = findStep(hash);
      const stepPayload = {
        ...step,
        isEnabled: true,
        content: {
          ...step.content,
          sql_query,
        },
      };
      const payload = getRiverForMetadataCall(
        selectedRiver,
        CallType.SQL_RESULTS,
        null,
        stepPayload,
      );
      const response: ResultsResponse = await fetchResults(payload);
      const results = await API.metadata.getResults(response?.results);

      const res = results?.results.map(row => {
        const keys = Object.keys(row);
        for (let key in keys) {
          if (['object', 'boolean'].includes(typeof row[keys[key]])) {
            row[keys[key]] = JSON.stringify(row[keys[key]]);
          }
        }
        return row;
      }); //stringify objects inside the results (temp fix for SUP-1362)

      return {
        results: res,
        compiled: results?.compiled_query,
        limit: results?.query_limit,
        errorMessage: results?.error_message,
        pullRequestId: getId(response),
      };
    },
    [selectedRiver, findStep, fetchResults],
  );
  const { value, loading } = state;
  const errorMessage = useErrorState(
    state.error?.message || value?.errorMessage,
    clearErrorDeps,
  );

  const hasResults = value?.results?.length > 0;
  const rows = hasResults ? value.results?.length : 0;
  const columns = hasResults ? Object.keys(value.results[0]).length : 0;

  return {
    runResults,
    hasResults,
    rows,
    columns,
    errorMessage,
    hasError: Boolean(errorMessage),
    loading,
    ...value,
  };
};

const useErrorState = (stateErrorMessage: string, clearError: boolean) => {
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    setErrorMessage(stateErrorMessage);
  }, [stateErrorMessage]);
  useEffect(() => {
    clearError && setErrorMessage('');
  }, [clearError]);

  return errorMessage;
};

type ResultsResponse = {
  request_status: RunStatus;
  _id: OID;
  results: string;
};
