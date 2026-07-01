import { Flex, Text, Icon, NotificationsEmpty } from 'components';

export function NotificationsEmptyState() {
  return (
    <Flex
      w="100%"
      maxW="520px"
      flexDir="column"
      alignItems="center"
      textAlign="center"
      py={16}
      gap={1}
    >
      <Icon as={NotificationsEmpty} boxSize="120px" />
      <Text textStyle="M5" color="font">
        Create your first notification
      </Text>
      <Text textStyle="R7" color="font-secondary">
        Add notifications to get real-time updates on your BDU usage
      </Text>
    </Flex>
  );
}
