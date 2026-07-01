import { Flex } from 'components';
import { StreamConfigurations } from './LogPosition';

export default function MongoSource() {
  return (
    <Flex flexDir="column" gap={2} w="full">
      <StreamConfigurations />
    </Flex>
  );
}
