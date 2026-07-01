import { Flex, Icon, Text, ToastPositionWithLogical } from '@chakra-ui/react';
import { CloseIconButton } from 'components/Buttons';
import { ExclamationInfoFilled } from 'components/Icons';

export function CreateErrorToastWithAction(
  toast,
  title,
  description,
  action,
  id?: string,
) {
  // If id is provided and toast is already active, don't show another one
  if (id && toast.isActive(id)) {
    return;
  }

  return toast({
    id,
    title,
    description,
    position: 'top' as ToastPositionWithLogical,
    duration: 60000,
    status: 'error',
    isClosable: true,
    render: () => (
      <Flex
        gap={2}
        bg="white"
        alignSelf="center"
        maxW="500px"
        p={4}
        border="1px"
        borderColor="red.100"
        borderRadius={4}
        alignItems="start"
        position="relative"
      >
        <Icon as={ExclamationInfoFilled} color="red.100" boxSize={4} mt="2px" />
        <Flex gap={2} flexDirection="column" maxW="450px">
          <Text fontWeight="bold" color="red.100">
            {title}
          </Text>
          <Text>{description}</Text>
          {action}
        </Flex>
        <CloseIconButton
          aria-label="close-toast"
          onClick={toast.closeAll}
          position="absolute"
          top="6px"
          right={0}
        />
      </Flex>
    ),
  });
}
