import { Center, Flex } from 'components';
import { Scheduler } from '../Scheduler';
import { GeneralSettings } from './GeneralSettings';

export function ScheduleAndNotifications() {
  return (
    <Center overflow="auto" h="full" sx={{ scrollbarGutter: 'stable' }}>
      <Flex h="full" w="440px" flexDir="column" gap={8}>
        <Scheduler />
        <GeneralSettings />
      </Flex>
    </Center>
  );
}
