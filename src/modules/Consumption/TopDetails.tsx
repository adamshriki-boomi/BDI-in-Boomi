import { Flex, Text } from 'components';
import React from 'react';
import {
  AccountAction,
  AccountDescription,
  AccountHeader,
} from './AccountTypeInfo';

export const TopSection = ({ planType }) => {
  return (
    <Flex gap={1} flexDir="column">
      <Text textStyle="M7">Your Current Plan</Text>
      <Flex
        aria-label="Consumption-top-section"
        flexDir="column"
        boxShadow="md"
        textAlign="left"
        p={6}
        gap={2}
        bg="white"
        minH="200px"
        minW="680px"
        border="1px solid var(--chakra-colors-purple-50)"
        borderRadius={4}
      >
        <AccountHeader type={planType} />
        <Flex alignItems="flex-end" justify="space-between" h="full">
          <AccountDescription type={planType} />
          <AccountAction type={planType} />
        </Flex>
      </Flex>
    </Flex>
  );
};
