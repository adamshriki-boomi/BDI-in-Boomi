import { CloseIconButton, Flex, HStack, Text } from 'components';
import React from 'react';
import { DocsSearchSection } from './DocsSearch';
export function Header({ dismissDrawer }) {
  return (
    <Flex flex={1} gap={4} flexDir="column" pt="10px" px={6}>
      <HStack
        justify="space-between"
        borderBottom="1px solid"
        borderBottomColor="border"
      >
        <Text textStyle="M4">Guides & Help</Text>
        <CloseIconButton
          aria-label="close-drawer"
          onClick={dismissDrawer}
          p={0}
        />
      </HStack>
      <DocsSearchSection />
    </Flex>
  );
}
