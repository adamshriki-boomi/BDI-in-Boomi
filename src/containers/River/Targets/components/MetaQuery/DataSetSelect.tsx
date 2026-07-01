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
import { useFormContext, UseFormReturn } from 'react-hook-form';
import { useAsyncFn } from 'react-use';
import { MetadataType, TaskType } from 'store/metadata/metadata.types';
import { useLazyGetMetadataV1Query } from 'store/metadata/metadataSvcV1';
import { compare } from 'utils/array.utils';
import { RefreshButton } from './RefreshButton';

interface DataSetSelectProps extends Partial<FormSelectProps> {
  connectionId: string;
  useFormApi: Partial<UseFormReturn>;
  value?: string | SelectOptionType;
  type?: MetadataTypeEnum;
  task_type?: TaskType;
  datasource_id?: string;
}

const getValue = (options, formApi, label) => {
  const { watch } = formApi;
  const value = watch(label);
  return value
    ? options?.find(compare('label', value)) ?? { value, label: value }
    : undefined;
};

export function DataSetSelect({
  connectionId,
  useFormApi,
  value,
  name,
  task_type,
  datasource_id = '',
  ...props
}: DataSetSelectProps) {
  const formApi = useFormContext();
  const connection_id =
    connectionId ?? formApi?.watch('river.properties.target.connection_id');
  const [getDatasets, { data: datasetsResponse = [] }] =
    useLazyGetMetadataV1Query();
  const isRiverDisabled = useIsDisabledRiverForm();
  const [{ loading }, loadDatasets] = useAsyncFn(
    async (connection_id, poll = false) =>
      await getDatasets({
        pull_request_inputs: { connection_id },
        task: `get_${MetadataTypeEnum.DATASETS}` as MetadataType,
        task_type,
        datasource_id,
        poll,
      }),
    [],
  );

  useEffect(() => {
    if (!isRiverDisabled && connection_id) {
      loadDatasets(connection_id);
    }
  }, [loadDatasets, connection_id, isRiverDisabled]);

  return (
    <Grid templateColumns="1fr auto" alignItems="start" gap={3}>
      <CustomSelectForm
        label="Dataset ID"
        name={name}
        options={datasetsResponse}
        isValidNewOption={isVariableString}
        controlId="dataset"
        api={useFormApi}
        value={value ?? getValue(datasetsResponse, useFormApi, name)}
        editableCreate
        defaultCreateLabel=""
        placeholder="Select dataset or use a variable"
        isClearable
        withCreate
        isMulti={false}
        {...props}
      />
      <RefreshButton
        load={() => loadDatasets(connection_id, true)}
        loading={loading}
        isDisabled={!connection_id}
      />
    </Grid>
  );
}
