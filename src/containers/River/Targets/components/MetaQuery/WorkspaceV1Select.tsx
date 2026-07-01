import { MetadataType as MetadataTypeEnum } from 'api/endpoints/metadata.api';
import { Grid } from 'components';
import {
  CustomSelectForm,
  FormSelectProps,
  SelectOptionType,
} from 'components/Form';
import { isVariableString } from 'containers/River/hooks/useAsyncMetadata';
import { useIsDisabledRiverForm } from 'modules/SourceTarget';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAsyncFn } from 'react-use';
import { MetadataType, TaskType } from 'store/metadata/metadata.types';
import { useLazyGetMetadataV1Query } from 'store/metadata/metadataSvcV1';
import { getValue } from './helpers';
import { RefreshButton } from './RefreshButton';

interface WorkspaceSelectProps extends Partial<FormSelectProps> {
  connectionId: string;
  value?: string | SelectOptionType;
  task_type?: TaskType;
  datasource_id?: string;
}

export function WorkspaceV1Select({
  connectionId,
  name,
  task_type,
  datasource_id = '',
  ...props
}: WorkspaceSelectProps) {
  const formApi = useFormContext();
  const connection_id =
    connectionId ?? formApi?.watch('river.properties.target.connection_id');
  const [getWorkspaceMetadata, { data: workspaceResponse = [], error }] =
    useLazyGetMetadataV1Query();
  const isRiverDisabled = useIsDisabledRiverForm();
  const [{ loading }, loadWorkspaceOptions] = useAsyncFn(
    async (connection_id, poll = false) =>
      await getWorkspaceMetadata({
        pull_request_inputs: { connection_id },
        task: `get_${MetadataTypeEnum.WORKSPACES}` as MetadataType,
        task_type,
        datasource_id,
        poll,
      }),
    [],
  );

  useEffect(() => {
    if (connection_id && !isRiverDisabled) {
      loadWorkspaceOptions(connection_id);
    }
  }, [connection_id, isRiverDisabled, loadWorkspaceOptions]);

  return (
    <Grid templateColumns="1fr auto" alignItems="start" gap={3}>
      <CustomSelectForm
        label="Workspace"
        name={name}
        options={loading || error ? [] : workspaceResponse}
        isValidNewOption={isVariableString}
        controlId="workspace"
        api={formApi}
        value={getValue(workspaceResponse, formApi, name)}
        editableCreate
        defaultCreateLabel=""
        placeholder="Select workspace or use a variable"
        isClearable
        withCreate
        isMulti={false}
        {...(error && { displayError: 'Error fetching workspaces' })}
        {...props}
      />

      <RefreshButton
        load={() => loadWorkspaceOptions(connection_id, true)}
        isDisabled={!connection_id}
        loading={loading}
      />
    </Grid>
  );
}
