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

interface RepositorySelectProps extends Partial<FormSelectProps> {
  connectionId: string;
  defaultOption?: { value: string; label: string } | null;
}

export function RepositorySelect({
  connectionId,
  name,
  defaultOption,
  ...props
}: RepositorySelectProps) {
  const formApi = useFormContext();
  const connection_id =
    connectionId ?? formApi?.watch('river.properties.target.connection_id');
  const [getRepoMetadata, { data: repoResponse = [], error }] =
    useLazyGetMetadataV1Query();
  const isRiverDisabled = useIsDisabledRiverForm();
  const [{ loading }, loadRepoOptions] = useAsyncFn(
    async (connection_id, poll = false) =>
      await getRepoMetadata({
        pull_request_inputs: { connection_id },
        task: 'get_repositories',
        task_type: 'target',
        datasource_id: TargetTypesV1.KNOWLEDGE_HUB,
        poll,
      }),
    [],
  );

  useEffect(() => {
    if (connection_id && !isRiverDisabled) {
      loadRepoOptions(connection_id);
    }
  }, [connection_id, isRiverDisabled, loadRepoOptions]);

  const options = useMemo(() => {
    const base = loading || error ? [] : repoResponse;
    if (
      defaultOption?.value &&
      !base.some(opt => opt?.value === defaultOption.value)
    ) {
      return [defaultOption, ...base];
    }
    return base;
  }, [loading, error, repoResponse, defaultOption]);

  return (
    <Grid templateColumns="1fr auto" alignItems="start" gap={3}>
      <CustomSelectForm
        label="Repository"
        name={name}
        options={options}
        isValidNewOption={isVariableString}
        controlId="repository"
        api={formApi}
        selectProps={khSelectProps}
        defaultCreateLabel=""
        placeholder="Select repository or enter ID"
        isClearable
        withCreate
        isMulti={false}
        {...(error && { displayError: 'Error fetching repositories' })}
        {...props}
      />
      <RefreshButton
        load={() => loadRepoOptions(connection_id, true)}
        isDisabled={!connection_id}
        loading={loading}
      />
    </Grid>
  );
}
