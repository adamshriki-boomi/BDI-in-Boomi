import { Flex } from 'components';
import { StreamConfigurations } from './LogPosition';
import { ReplaceInvalidCharsSwitch } from './ReplaceInvalidCharsSwitch';
import { useFormContext } from 'react-hook-form';

export default function MySQLSource() {
  const formApi = useFormContext();

  return (
    <Flex flexDir="column" gap={3}>
      <StreamConfigurations />
      <ReplaceInvalidCharsSwitch api={formApi} />
    </Flex>
  );
}
