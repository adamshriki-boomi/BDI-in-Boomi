import { Flex } from 'components';
import { ReplaceInvalidCharsSwitch } from './ReplaceInvalidCharsSwitch';
import { useFormContext } from 'react-hook-form';

export default function MariaDBSource() {
  const formApi = useFormContext();

  return (
    <Flex flexDir="column" gap={3}>
      <ReplaceInvalidCharsSwitch api={formApi} />
    </Flex>
  );
}
