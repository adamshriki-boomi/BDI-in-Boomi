import { TargetTypesV1 } from 'api/types';
import { Grid } from 'components';
import { CustomSelectForm, FormSelectProps } from 'components/Form';
import { isVariableString } from 'containers/River/hooks/useAsyncMetadata';
import { useIsDisabledRiverForm } from 'modules/SourceTarget';
import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAsyncFn } from 'react-use';
import { useLazyGetMetadataV1Query } from 'store/metadata/metadataSvcV1';
import { RefreshButton } from './RefreshButton';
import { khSelectProps } from './helpers';

interface KnowledgeBaseSelectProps extends Partial<FormSelectProps> {
  connectionId: string;
  repositoryId?: string;
  defaultOption?: { value: string; label: string } | null;
}

export function KnowledgeBaseSelect({
  connectionId,
  repositoryId,
  name,
  defaultOption,
  ...props
}: KnowledgeBaseSelectProps) {
  const formApi = useFormContext();
  const connection_id =
    connectionId ?? formApi?.watch('river.properties.target.connection_id');
  const [getKBMetadata, { data: kbResponse = [], error }] =
    useLazyGetMetadataV1Query();
  const isRiverDisabled = useIsDisabledRiverForm();
  const [{ loading }, loadKBOptions] = useAsyncFn(
    async (connection_id, repository_id, poll = false) =>
      await getKBMetadata({
        pull_request_inputs: {
          connection_id,
          ...(repository_id && { repository_id }),
        },
        task: 'get_knowledge_bases',
        task_type: 'target',
        datasource_id: TargetTypesV1.KNOWLEDGE_HUB,
        poll,
      }),
    [],
  );

  useEffect(() => {
    if (connection_id && repositoryId && !isRiverDisabled) {
      loadKBOptions(connection_id, repositoryId);
    }
  }, [connection_id, repositoryId, isRiverDisabled, loadKBOptions]);

  const options = useMemo(() => {
    const base = loading || error ? [] : kbResponse;
    if (
      defaultOption?.value &&
      !base.some(opt => opt?.value === defaultOption.value)
    ) {
      return [defaultOption, ...base];
    }
    return base;
  }, [loading, error, kbResponse, defaultOption]);

  return (
    <Grid templateColumns="1fr auto" alignItems="start" gap={3}>
      <CustomSelectForm
        label="Knowledge Base"
        name={name}
        options={options}
        isValidNewOption={isVariableString}
        controlId="knowledge_base"
        api={formApi}
        selectProps={khSelectProps}
        defaultCreateLabel=""
        placeholder={
          repositoryId
            ? 'Select knowledge base or enter ID'
            : 'Select a repository first'
        }
        isClearable
        withCreate
        isMulti={false}
        isDisabled={!repositoryId}
        {...(error && { displayError: 'Error fetching knowledge bases' })}
        {...props}
      />
      <RefreshButton
        load={() => loadKBOptions(connection_id, repositoryId, true)}
        isDisabled={!connection_id || !repositoryId}
        loading={loading}
      />
    </Grid>
  );
}
