import { Flex, Grid, RenderGuard, RiveryButton } from 'components';
import {
  CustomSelectForm,
  FormSelectProps,
  SelectOptionType,
} from 'components/Form';
import { useIsDisabledRiverForm } from 'modules/SourceTarget';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAsyncFn } from 'react-use';
import { MetadataType } from 'store/metadata/metadata.types';
import { useLazyGetMetadataV1Query } from 'store/metadata/metadataSvcV1';
import { getValue } from './helpers';
import { RefreshButton } from './RefreshButton';

interface SchemaSelectProps extends Partial<FormSelectProps> {
  value?: string | SelectOptionType;
  errorPrompt?: boolean;
  connectionId?: string;
  datasource_id?: string;
}

export function BucketSelect({
  step,
  value,
  name,
  errorPrompt,
  task = 'get_buckets',
  onSetDefault = null,
  ...props
}: SchemaSelectProps) {
  const formApi = useFormContext();
  const connection_id =
    props.connectionId ??
    formApi?.watch('river.properties.target.connection_id');
  const [getSchemaMetadata, { data: bucketsResponse = [] }] =
    useLazyGetMetadataV1Query();
  const isRiverDisabled = useIsDisabledRiverForm();
  const [{ loading }, loadBucketsOptions] = useAsyncFn(
    async (connection_id, poll = false) =>
      getSchemaMetadata({
        pull_request_inputs: { connection_id },
        task: task || ('get_buckets' as MetadataType),
        task_type: props.task_type,
        datasource_id: props?.datasource_id,
        poll,
      }),
    [],
  );

  useEffect(() => {
    if (!isRiverDisabled && connection_id) {
      loadBucketsOptions(connection_id);
    }
  }, [isRiverDisabled, loadBucketsOptions, connection_id]);

  return (
    <Flex flexDir="column" gap={1}>
      <Grid templateColumns="1fr auto" alignItems="start" gap={3}>
        <CustomSelectForm
          label="Bucket Name"
          name={name}
          options={loading ? [] : bucketsResponse}
          controlId="bucket_id"
          api={formApi}
          value={value ?? getValue(bucketsResponse, formApi, name)}
          editableCreate
          placeholder="Select bucket"
          isClearable
          isMulti={false}
          withCreate
          {...props}
        />
        <RefreshButton
          loading={loading}
          load={() => loadBucketsOptions(connection_id, true)}
          isDisabled={!connection_id}
        />
      </Grid>
      <RenderGuard condition={Boolean(onSetDefault)}>
        <RiveryButton
          label="Restore to default file zone settings"
          variant="link"
          size="small"
          alignSelf="start"
          color="primary"
          textDecoration="none"
          onClick={onSetDefault}
        />
      </RenderGuard>
    </Flex>
  );
}
