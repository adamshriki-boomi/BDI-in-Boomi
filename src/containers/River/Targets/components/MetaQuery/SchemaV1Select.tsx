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

interface SchemaSelectProps extends Partial<FormSelectProps> {
  value?: string | SelectOptionType;
  connectionId?: string;
  dependentFields?: string[];
  datasource_id?: string;
  task_type?: TaskType;
}

export function SchemaV1Select({
  value,
  name,
  dependentFields = [],
  ...props
}: SchemaSelectProps) {
  const formApi = useFormContext();
  const connection_id =
    props.connectionId ??
    formApi?.watch('river.properties.target.connection_id');
  const [getSchemaMetadata, { data: schemasResponse = [], error }] =
    useLazyGetMetadataV1Query();
  const isRiverDisabled = useIsDisabledRiverForm();
  const dependentValues: Record<string, any> = {};
  dependentFields.forEach(fieldName => {
    dependentValues[fieldName] = formApi?.watch(
      `river.properties.target.${fieldName}`,
    );
  });
  const allDependenciesSet =
    dependentFields.length > 0 &&
    dependentFields.every(fieldName => Boolean(dependentValues[fieldName]));
  const dependentValuesSig = JSON.stringify(dependentValues);
  const [{ loading }, loadSchemaOptions] = useAsyncFn(
    async (connection_id, payloadContext, poll = false) =>
      getSchemaMetadata({
        pull_request_inputs: {
          connection_id,
          ...payloadContext,
        },
        task: `get_${MetadataTypeEnum.SCHEMAS}` as MetadataType,
        task_type: props?.task_type,
        datasource_id: props?.datasource_id,
        poll,
      }),
    [],
  );
  useEffect(() => {
    if (
      !isRiverDisabled &&
      (dependentFields.length > 0 ? allDependenciesSet : connection_id)
    ) {
      loadSchemaOptions(connection_id, dependentValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allDependenciesSet,
    isRiverDisabled,
    loadSchemaOptions,
    connection_id,
    dependentValuesSig,
  ]);
  return (
    <Grid templateColumns="1fr auto" alignItems="start" gap={3}>
      <CustomSelectForm
        label="Schema"
        name={name}
        options={loading || error ? [] : schemasResponse}
        isValidNewOption={isVariableString}
        controlId="schema_id"
        api={formApi}
        value={value ?? getValue(schemasResponse, formApi, name)}
        editableCreate
        defaultCreateLabel=""
        placeholder="Select schema or use a variable"
        isClearable
        isMulti={false}
        withCreate
        {...(error && { displayError: 'Error fetching schemas' })}
        {...props}
      />
      <RefreshButton
        load={() => loadSchemaOptions(connection_id, dependentValues, true)}
        isDisabled={
          !connection_id || (dependentFields.length > 0 && !allDependenciesSet)
        }
        loading={loading}
      />
    </Grid>
  );
}
