import {
  DateDisplay,
  Divider,
  Flex,
  HStack,
  Icon,
  InfoTooltip,
  RenderGuard,
  RiveryOverlay,
  Text,
} from 'components';
import { useSttMetadata } from 'modules/SourceTarget';
import { getTimeZone } from 'utils/date.utils';
import { UTCTimezoneView } from './ScheduleOverview';

export default function ActivationUpdates() {
  const metadata = useSttMetadata();
  const utcTime = metadata?.suspended?.suspension_date;
  const localDate = new Date(utcTime + 'Z'); // Adding 'Z' ensures it's treated as UTC
  const localTimeString = localDate.toLocaleString();

  return (
    <RenderGuard condition={Boolean(metadata?.suspended?.suspension_date)}>
      <Flex justify="space-between" alignItems="center">
        <Text>Last Disabled</Text>
        <Flex gap={1} alignItems="center">
          <RiveryOverlay
            placement="bottom"
            description="Automatically suspended after 7 days of consecutive failures to prevent repeated errors and system overload. Please reactivate once the issue is fixed"
            portal
            p={0}
          >
            <HStack alignItems="center">
              <Text textStyle="R7">
                Data Flow suspended due to consecutive errors
              </Text>
              <Icon as={InfoTooltip} color="font-secondary" />
            </HStack>
          </RiveryOverlay>
          /
          <Flex gap={1}>
            <DateDisplay value={localTimeString} /> (UTC {getTimeZone()}){' '}
            <UTCTimezoneView utcTime={metadata?.suspended?.suspension_date} />
          </Flex>
        </Flex>
      </Flex>
      <Divider
        orientation="horizontal"
        border="2px"
        borderColor="background-secondary"
      />
    </RenderGuard>
  );
}
