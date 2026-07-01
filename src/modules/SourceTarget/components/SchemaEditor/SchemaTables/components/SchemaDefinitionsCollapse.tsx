import { Box, Collapse, useDisclosure } from '@chakra-ui/react';
import { ChevronDown, ChevronUp, Flex, HStack, Icon, Text } from 'components';
import * as React from 'react';
export function DefinitionsCollapse({ type, children, defaultOpen = false }) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: defaultOpen });
  return (
    <>
      <HStack role="button" onClick={onToggle} w="full" justify="space-between">
        <Text color="primary" textStyle="M6" textTransform="capitalize">
          Advanced {type} Definitions
        </Text>
        <Icon boxSize={4} as={isOpen ? ChevronUp : ChevronDown} />
      </HStack>

      <Box borderTop="1px" borderTopColor={isOpen ? 'transparent' : 'gray.300'}>
        <Collapse in={isOpen}>
          <Flex border="1px" borderColor="gray.300" p={4} borderRadius={4}>
            {children}
          </Flex>
        </Collapse>
      </Box>
    </>
  );
}
