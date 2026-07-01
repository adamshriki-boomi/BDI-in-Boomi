import { TargetTypes, TargetTypesV1 } from 'api/types';
import { Flex } from 'components';
import { useGetTargetTypesQuery } from 'modules/Datasources/store/targets.query';
import { useController, useFormContext } from 'react-hook-form';
import { SettingsHeader } from './commonTargetSettings';
import { BucketSelect } from 'containers/River/Targets/components/MetaQuery/BucketSelect';
import { FzLoadingModes } from './fzLoadingModes';

export enum PartitionKindEnum {
  BY_DAY = 'by_day',
  BY_HOUR = 'by_hour',
  BY_MINUTE = 'by_minute',
}

export default function TargetS3() {
  const formApi = useFormContext();
  const { data: targets } = useGetTargetTypesQuery();

  const fz = targets?.find(
    target => target.target_type === TargetTypes.AMAZON_S3,
  )?.file_zone_settings;

  const { field: bucketName } = useController({
    name: 'river.properties.target.bucket_name',
    control: formApi.control,
    defaultValue: fz?.bucket,
  });

  return (
    <>
      <SettingsHeader />
      <Flex flexDir="column" gap="4" w="450px">
        <BucketSelect
          connectionId={formApi.watch('river.properties.target.connection_id')}
          name="river.properties.target.bucket_name"
          datasource_id={TargetTypesV1.AMAZON_S3}
          task_type="source"
          onSetDefault={() => bucketName.onChange(fz?.bucket)}
          required
        />
        <FzLoadingModes />
      </Flex>
    </>
  );
}
