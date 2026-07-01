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
import { getValue } from './helpers';
import { RefreshButton } from './RefreshButton';
import { Text } from '../../../../../components';

interface DataSetSelectProps extends Partial<FormSelectProps> {
  connectionId: string;
  useFormApi: Partial<UseFormReturn>;
  value?: string | SelectOptionType;
  type?: MetadataTypeEnum;
  task_type?: TaskType;
  datasource_id?: string;
}

export function CatalogSelect({
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
  const [getCatalogs, { data: catalogsResponse = [] }] =
    useLazyGetMetadataV1Query();
  const isRiverDisabled = useIsDisabledRiverForm();
  const [{ loading }, loadCatalogs] = useAsyncFn(
    async (connection_id, poll = false) =>
      await getCatalogs({
        pull_request_inputs: { connection_id },
        task: `get_${MetadataTypeEnum.CATALOGS}` as MetadataType,
        task_type,
        datasource_id,
        poll,
      }),
    [],
  );

  useEffect(() => {
    if (!isRiverDisabled && connection_id) {
      loadCatalogs(connection_id);
    }
  }, [loadCatalogs, connection_id, isRiverDisabled]);

  return (
    <Grid templateColumns="1fr auto" alignItems="start" gap={3}>
      <CustomSelectForm
        label="Catalog"
        secondaryLabel={
          <Text whiteSpace="pre" textStyle="R8">
            Leave this field blank to use the default catalog from your
            connection.
          </Text>
        }
        name={name}
        metadataResponse={catalogsResponse}
        options={loading ? [] : catalogsResponse}
        isValidNewOption={isVariableString}
        controlId="catalog"
        api={useFormApi}
        value={value ?? getValue(catalogsResponse, useFormApi, name)}
        editableCreate
        defaultCreateLabel=""
        placeholder="Select catalog or write your own"
        isClearable
        withCreate
        isMulti={false}
        {...props}
      />
      <RefreshButton
        isDisabled={!connection_id}
        load={() => loadCatalogs(connection_id, true)}
        loading={loading}
      />
    </Grid>
  );
}
