import { Flex, Text } from 'components';
import { Input } from 'components/Form';
import { StreamConfigurations } from './LogPosition';
import { useFormContext } from 'react-hook-form';

export default function PostgresSource() {
  const formApi = useFormContext();

  return (
    <Flex flexDir="column" gap={2} w="full">
      <StreamConfigurations />
      <Text>Stream Configurations</Text>
      <Input
        optional
        api={formApi}
        name="river.properties.source.cdc_settings.custom_replication_slot"
        label="Set custom replication slot name or use this default"
        placeholder="rivery_{account_id}_{river_id}_source"
        chakra
      />
      <Input
        optional
        api={formApi}
        name="river.properties.source.cdc_settings.custom_publication"
        label="Set custom publication name or use this default"
        placeholder="rivery_{account_id}_{river_id}_source"
        chakra
      />
    </Flex>
  );
}
