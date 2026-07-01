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

interface LakehouseSelectProps extends Partial<FormSelectProps> {
  value?: string | SelectOptionType;
  connectionId?: string;
  dependentFieldName?: string;
  datasource_id?: string;
  task_type?: TaskType;
  workspaceRequired?: boolean;
}

export function LakehouseV1Select({
  value,
  name,
  workspaceRequired = false,
  dependentFieldName = null,
  ...props
}: LakehouseSelectProps) {
  const formApi = useFormContext();
  const connection_id =
    props.connectionId ??
    formApi?.watch('river.properties.target.connection_id');
  const [getLakehouseMetadata, { data: lakehouseResponse = [], error }] =
    useLazyGetMetadataV1Query();
  const isRiverDisabled = useIsDisabledRiverForm();
  const [{ loading }, loadLakehouseOptions] = useAsyncFn(
    async (connection_id, fieldValue, poll = false) =>
      getLakehouseMetadata({
        pull_request_inputs: {
          connection_id,
          [dependentFieldName]: fieldValue,
        },
        task: `get_${MetadataTypeEnum.LAKEHOUSES}` as MetadataType,
        task_type: props?.task_type,
        datasource_id: props?.datasource_id,
        poll,
      }),
    [],
  );
  const fieldValue =
    dependentFieldName &&
    formApi?.watch(`river.properties.target.${dependentFieldName}`);
  useEffect(() => {
    if (!isRiverDisabled && (dependentFieldName ? fieldValue : connection_id)) {
      loadLakehouseOptions(connection_id, fieldValue);
    }
  }, [
    dependentFieldName,
    fieldValue,
    isRiverDisabled,
    loadLakehouseOptions,
    connection_id,
  ]);
  return (
    <Grid templateColumns="1fr auto" alignItems="start" gap={3}>
      <CustomSelectForm
        label="Lakehouse"
        name={name}
        options={loading || error ? [] : lakehouseResponse}
        isValidNewOption={isVariableString}
        controlId="lakehouse_id"
        api={formApi}
        value={value ?? getValue(lakehouseResponse, formApi, name)}
        editableCreate
        defaultCreateLabel=""
        placeholder="Select lakehouse or use a variable"
        isClearable
        isMulti={false}
        withCreate
        {...(error && { displayError: 'Error fetching lakehouses' })}
        {...props}
      />
      <RefreshButton
        load={() => loadLakehouseOptions(connection_id, fieldValue, true)}
        isDisabled={!connection_id || (workspaceRequired && !fieldValue)}
        loading={loading}
      />
    </Grid>
  );
}
