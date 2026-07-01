import { Flex, RenderGuard, Text } from 'components';
import { CustomSelectForm, Input } from 'components/Form';
import { FZBucketTarget } from 'hooks/useFZBuckets';
import { useGetConnectionQuery } from 'modules/ConnectionModal';
import { useEffect } from 'react';
import { getOId } from 'utils/api.sanitizer';

export const CustomFzTarget = ({ api, connId, bq = false }) => {
  const { data: targetConnection } = useGetConnectionQuery(connId, {
    skip: !connId,
  });
  const { data: fzConnection } = useGetConnectionQuery(
    bq
      ? getOId(targetConnection?.cross_id)
      : getOId(targetConnection?.fz_connection_id),
    {
      skip: bq
        ? !getOId(targetConnection?.cross_id)
        : !getOId(targetConnection?.fz_connection_id),
    },
  );
  const displayCustomFzSection = targetConnection?.custom_fz;
  useEffect(() => {
    if (targetConnection) {
      const target = api.getValues().river.properties.target;
      if (displayCustomFzSection) {
        if (
          !target?.file_zone_settings?.path &&
          !target?.file_zone_settings?.partitioned_kind
        ) {
          api.setValue('river.properties.target.file_zone_settings', {
            path: '{river_name}_{river_id}',
            partitioned_kind: 'by_day',
          });
        }
      } else {
        if (target?.file_zone_settings) {
          const { file_zone_settings, ...newTarget } = target;
          api.setValue('river.properties.target', newTarget);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetConnection]); //change only when target connection is changed

  return (
    <RenderGuard condition={displayCustomFzSection}>
      <Flex flexDir="column" gap={2}>
        <Text color="primary">Custom File Zone</Text>
        <Flex
          flexDir="column"
          gap="4"
          p="4"
          border="1px"
          borderRadius="md"
          borderColor="gray.300"
        >
          <Flex flexDir="column">
            <FZBucketTarget
              targetConnection={targetConnection}
              api={api}
              fzConnectionType={fzConnection?.connection_type}
              name="river.properties.target.file_zone_settings.bucket_name"
              placeholder={targetConnection?.default_bucket}
            />
            <Text textStyle="R8" color="font-secondary" lineHeight="16px">
              The default bucket name defined in your Target connection.
              <br /> Edit to overwrite the default setting for this Data Flow.
            </Text>
          </Flex>

          <Input
            label="File Zone Path"
            chakra
            api={api}
            name="river.properties.target.file_zone_settings.path"
          />
          <CustomSelectForm
            name="river.properties.target.file_zone_settings.partitioned_kind"
            options={partitionKindOptions}
            label="File Zone Folders Period Partition"
            api={api}
            controlId="partition_kind"
            isMulti={false}
          />
        </Flex>
      </Flex>
    </RenderGuard>
  );
};

const partitionKindOptions = [
  { value: 'by_day', label: 'By Day' },
  { value: 'by_hour', label: 'By Hour' },
  { value: 'by_minute', label: 'By Minute' },
];
