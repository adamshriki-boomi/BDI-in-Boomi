import { TargetTypesV1 } from 'api/types';
import { Flex } from 'components';
import { useGetTargetTypesQuery } from 'modules/Datasources/store/targets.query';
import { useController, useFormContext } from 'react-hook-form';
import { SettingsHeader } from './commonTargetSettings';
import { BucketSelect } from 'containers/River/Targets/components/MetaQuery/BucketSelect';
import { compare } from 'utils/array.utils';
import { FzLoadingModes } from './fzLoadingModes';

export default function TargetBlob() {
  const formApi = useFormContext();
  const { data: targets } = useGetTargetTypesQuery();

  const fz = targets?.find(
    compare('target_type', TargetTypesV1.AZURE_BLOB),
  )?.file_zone_settings;

  const { field: containerName } = useController({
    name: 'river.properties.target.container_name',
    control: formApi.control,
    defaultValue: fz?.bucket,
  });

  return (
    <>
      <SettingsHeader />
      <Flex flexDir="column" gap="4" w="450px">
        <BucketSelect
          label="Container Name"
          connectionId={formApi.watch('river.properties.target.connection_id')}
          name="river.properties.target.container_name"
          datasource_id={TargetTypesV1.AZURE_BLOB}
          task="get_containers"
          task_type="source"
          onSetDefault={() => containerName.onChange(fz?.bucket)}
          required
        />
        <FzLoadingModes />
      </Flex>
    </>
  );
}
