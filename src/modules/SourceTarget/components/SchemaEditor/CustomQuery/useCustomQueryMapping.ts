import { useCallback, useEffect, useRef, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { pollPullRequest } from './pollPullRequest';

export type MergeReplaceAction = 'merge' | 'replace';

export interface CustomQueryMappingState {
  result: any;
  errorMessage: string;
  lastMappedQuery: string; // Track the query used for last successful mapping
}

const initialState: CustomQueryMappingState = {
  result: null,
  errorMessage: '',
  lastMappedQuery: '',
};

/**
 * Merge new columns with existing mapping.
 * Column order follows the new mapping result. For columns that exist in both,
 * the existing column data (manual changes) is preserved at the new index.
 * Columns that existed before but are absent from the new result are appended at the end.
 * Name comparison is case-insensitive.
 */
function mergeColumns(existingColumns: any[], newColumns: any[]): any[] {
  if (!existingColumns?.length) return newColumns || [];
  if (!newColumns?.length) return existingColumns;

  const existingByName = new Map(
    existingColumns.map(col => [col.name?.toLowerCase(), col]),
  );

  const result = newColumns.map(newCol => {
    const key = newCol.name?.toLowerCase();
    const existing = existingByName.get(key);
    if (existing) {
      existingByName.delete(key);
      return existing;
    }
    return newCol;
  });

  // Append columns that existed before but are no longer in the new query result
  result.push(...existingByName.values());

  return result;
}

/**
 * Hook to run custom query mapping.
 * Uses the pull_requests API with task: 'get_mapping' and task_type: 'source'.
 */
export function useCustomQueryMapping() {
  const formApi = useFormContext();

  const { field: connectionIdField } = useController({
    name: 'river.properties.source.connection_id',
    control: formApi.control,
  });

  const { field: dataSourceIdField } = useController({
    name: 'river.properties.source.name',
    control: formApi.control,
  });

  const { field: targetNameField } = useController({
    name: 'river.properties.target.name',
    control: formApi.control,
  });

  const { field: sqlCommandField } = useController({
    name: 'river.properties.source.custom_query_source_settings.query',
    control: formApi.control,
  });

  // Get saved mapping to check if mapping exists from before
  const { field: savedMappingField } = useController({
    name: 'river.properties.target.single_table_settings.mapping',
    control: formApi.control,
  });

  const [loading, setLoading] = useState(false);
  const [mappingState, setMappingState] =
    useState<CustomQueryMappingState>(initialState);

  // Track if we've initialized the lastMappedQuery from saved data
  const initializedRef = useRef(false);

  // Check if there's existing mapping (saved or from current session)
  const hasExistingMapping =
    (savedMappingField?.value && savedMappingField.value.length > 0) ||
    (mappingState.result && mappingState.result.length > 0);

  // Initialize lastMappedQuery with saved query if mapping exists from before
  useEffect(() => {
    if (!initializedRef.current) {
      const hasSavedMapping =
        savedMappingField?.value && savedMappingField.value.length > 0;
      const savedQuery = sqlCommandField?.value;

      // If there's saved mapping and a saved query, use it as the baseline
      if (hasSavedMapping && savedQuery) {
        setMappingState(prev => ({
          ...prev,
          lastMappedQuery: savedQuery,
        }));
      }
      initializedRef.current = true;
    }
  }, [savedMappingField?.value, sqlCommandField?.value]);

  const runMapping = useCallback(
    async (action: MergeReplaceAction = 'replace') => {
      const customQuery = sqlCommandField?.value;

      if (!customQuery?.trim()) {
        setMappingState(prev => ({
          ...prev,
          result: null,
          errorMessage: 'Please save a SQL query first',
        }));
        return;
      }

      // Reset previous state and start loading
      setMappingState(initialState);
      setLoading(true);

      try {
        const pollingStatus = await pollPullRequest({
          task_type: 'source',
          task: 'get_mapping',
          datasource_id: dataSourceIdField?.value,
          pull_request_inputs: {
            connection_id: connectionIdField?.value,
            target_type: targetNameField?.value,
            custom_query: customQuery,
          },
        });

        if (pollingStatus.status === 'D') {
          let finalResult = pollingStatus.result;

          // If merge action, merge new columns with existing mapping
          if (action === 'merge') {
            const existingColumns =
              savedMappingField?.value || mappingState.result || [];
            finalResult = mergeColumns(existingColumns, pollingStatus.result);
          }

          setMappingState({
            result: finalResult,
            errorMessage: pollingStatus?.error_message || '',
            lastMappedQuery: customQuery, // Store the query used for this mapping
          });
        } else {
          setMappingState(prev => ({
            ...prev,
            result: null,
            errorMessage:
              pollingStatus.error_message || 'Error running mapping',
          }));
        }

        return pollingStatus;
      } catch (error: any) {
        setMappingState(prev => ({
          ...prev,
          result: null,
          errorMessage:
            error?.message || 'An error occurred while running mapping',
        }));
      } finally {
        setLoading(false);
      }
    },
    [
      connectionIdField?.value,
      dataSourceIdField?.value,
      targetNameField?.value,
      sqlCommandField?.value,
      savedMappingField?.value,
      mappingState.result,
    ],
  );

  const hasError = Boolean(mappingState.errorMessage);

  // Check if query has changed since last successful mapping
  const currentQuery = sqlCommandField?.value || '';
  const queryChanged =
    mappingState.lastMappedQuery !== '' &&
    currentQuery !== mappingState.lastMappedQuery;

  return {
    runMapping,
    loading,
    hasError,
    queryChanged,
    hasExistingMapping,
    ...mappingState,
  };
}
