import { useStyleConfig } from '@chakra-ui/react';
import {
  Box,
  Flex,
  ListItem,
  RenderGuard,
  RiveryButton,
  Text,
  UnorderedList,
} from 'components';
import { useToggle } from 'react-use';

export function ErrorsDisplay({ response }) {
  const baseAlertStyles = useStyleConfig('Alert');
  const errorAlertStyles = useStyleConfig('Alert', {
    variant: 'solid',
    status: 'error',
  });

  const [showAll, setShowAll] = useToggle(false);
  const isResponseString = typeof response == 'string';
  const itemsToShowInitially = 4;
  return isResponseString ? (
    <Text>{response}</Text>
  ) : response?.length > 0 ? (
    <Flex flexDir="column" gap={2}>
      <Text color={(baseAlertStyles as any).description?.color}>
        One or more required fields are missing or incomplete. <br />
        Please fill out the necessary fields and try again.
      </Text>
      <Box
        borderRadius={4}
        border="1px"
        py={2}
        px={4}
        maxH="300px"
        overflow="auto"
        borderColor={(errorAlertStyles.container as any)?.borderColor}
      >
        <UnorderedList
          spacing={3}
          color={(baseAlertStyles as any).description?.color}
        >
          {response
            .slice(0, showAll ? response?.length : itemsToShowInitially)
            .map((error, index) => (
              <ListItem key={index}>
                {typeof error == 'string' ? error : error?.msg}
              </ListItem>
            ))}
          <RenderGuard
            condition={!showAll && response?.length > itemsToShowInitially}
          >
            <Flex justify="flex-end" mt={0}>
              <RiveryButton
                label={`Show ${
                  response?.length - itemsToShowInitially
                } more errors`}
                variant="text-link"
                colorScheme="danger"
                _hover={{ bg: 'none' }}
                onClick={setShowAll}
                p={0}
              />
            </Flex>
          </RenderGuard>
        </UnorderedList>
      </Box>
    </Flex>
  ) : (
    <Text>Something went wrong</Text>
  );
}
