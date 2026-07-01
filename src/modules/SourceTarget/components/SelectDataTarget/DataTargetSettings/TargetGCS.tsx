import { TargetTypes, TargetTypesV1 } from 'api/types';
import { Box } from 'components';
import { Input } from 'components/Form';
import { BucketSelect } from 'containers/River/Targets/components/MetaQuery/BucketSelect';
import { useGetTargetTypesQuery } from 'modules/Datasources/store/targets.query';
import { useCallback, useEffect } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useConnectionsByType } from 'store/connectionTypes';
import { getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { PartitionedKind, SettingsHeader } from './commonTargetSettings';
import { findDefaultValues } from './connectionDefaults';

export function TargetGCS() {
  const formApi = useFormContext();
  const connection_id = formApi.watch('river.properties.target.connection_id');
  const { connections } = useConnectionsByType('gcloud');
  const { data: targets } = useGetTargetTypesQuery();

  const fz = targets?.find(
    target => target.target_type === TargetTypes.GOOGLE_CLOUD_STORAGE,
  )?.file_zone_settings;

  const { field: bucketName } = useController({
    name: 'river.properties.target.bucket_name',
    control: formApi.control,
  });

  useEffect(() => {
    if (!bucketName.value) {
      bucketName.onChange(fz?.bucket);
    }
  }, [connection_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSetDefault = useCallback(() => {
    const selectedConnection = connections?.find(
      compare('_id', connection_id, getOId),
    );
    const value: any = findDefaultValues(
      ['bucket_name'],
      selectedConnection,
      TargetTypesV1.GOOGLE_CLOUD_STORAGE,
    );
    bucketName.onChange(value?.bucket_name ?? fz?.bucket);
  }, [bucketName, connection_id, connections, fz]);

  return (
    <>
      <SettingsHeader />
      <Box w="full">
        <BucketSelect
          connectionId={formApi.watch('river.properties.target.connection_id')}
          name="river.properties.target.bucket_name"
          datasource_id={TargetTypesV1.GOOGLE_CLOUD_STORAGE}
          task_type="source"
          onSetDefault={onSetDefault}
          required
        />
      </Box>
      <Box w="full">
        <Input
          chakra
          label="File Zone Path"
          api={formApi}
          name="river.properties.target.path"
          required
        />
      </Box>
      <Box w="full">
        <PartitionedKind formApi={formApi} />
      </Box>
    </>
  );
}
