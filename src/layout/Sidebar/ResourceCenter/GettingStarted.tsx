import { AppRoutes } from 'app/routes';
import { ChevronRight, Flex, HStack, Icon, Text } from 'components';
import { StepsHeader } from 'containers/Onboarding/components/Steps/StepsHeader';
import { useGetUserQuery } from 'containers/Settings/Users/usersV1.query';
import React from 'react';
import { generatePath, Link } from 'react-router-dom';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';

export function GettingStarted({ dismissDrawer }) {
  const {
    userId,
    activeAccountId: account_id,
    isAccountInTrial,
    envId: env,
  } = useCore();
  const { data: user } = useGetUserQuery({
    user_id: getOId(userId),
    account_id,
  });
  return (
    <Flex
      flexDir="column"
      border="1px solid"
      borderColor="border"
      borderRadius={4}
      mt={2}
      shadow="sm"
      p={4}
      gap={6}
      role="button"
      _hover={{
        borderColor: 'background-action-hover',
      }}
      as={Link}
      to={generatePath(AppRoutes.ONBOARDING, { env, account: account_id })}
      onClick={dismissDrawer}
      aria-label="get started"
    >
      <Flex flexDir="column">
        <HStack justify="space-between">
          <Text textStyle="M7">
            {isAccountInTrial ? 'Getting Started' : 'Onboarding'}
          </Text>
          <Icon as={ChevronRight} />
        </HStack>
        <Text color="font-secondary">
          Boost your experience & get the most out of your Data Integration
        </Text>
      </Flex>
      {isAccountInTrial && Boolean(user?.onboarding) ? (
        <StepsHeader onboarding={user.onboarding} resourceCenter />
      ) : null}
    </Flex>
  );
}
