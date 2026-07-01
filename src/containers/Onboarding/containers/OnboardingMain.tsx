import { Storage } from 'api/storage';
import { TopBarContext } from 'app/AppTopBarContext';
import { RoutesBuilder } from 'app/routes';
import {
  Background,
  Box,
  Flex,
  HStack,
  Icon,
  RenderGuard,
  Text,
  VStack,
} from 'components';
import { CloseIconButton } from 'components/Buttons/RiveryButton';
import { useGetUserQuery } from 'containers/Settings/Users/usersV1.query';
import { useOpacityCalculate } from 'modules/Environments/helpers';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';
import { LevelUp } from '../components/LevelUp';
import { OnboardingSteps } from '../components/OnboardingSteps';
import { StepsHeader } from '../components/Steps/StepsHeader';

export default function OnboardingProgress() {
  const { show: isVisible } = useContext(TopBarContext);
  const {
    username,
    userId,
    activeAccountId: account_id,
    envId: env,
  } = useCore();
  const stepperBGColor = useOpacityCalculate('purple.50', 0.3);
  const { data: user } = useGetUserQuery({
    user_id: getOId(userId),
    account_id,
  });
  useEffectOnce(() => Storage.store(Storage.Keys.SHOW_ONBOARDING_KEY, true));
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  return (
    <Box position="relative" overflow="hidden">
      <RenderGuard condition={exoTheme}>
        <Icon
          as={Background}
          w="978px"
          h="689px"
          position="absolute"
          right="-20rem"
          top="-28rem"
          transform="scaleX(-1)"
        />
        <Icon
          as={Background}
          w="978px"
          h="689px"
          position="absolute"
          left="-20rem"
          bottom="-30rem"
        />
      </RenderGuard>
      <VStack
        gap={3}
        w="full"
        position="relative"
        overflow="overlay"
        h={`calc(100vh - ${isVisible ? '45px' : '0px'})`}
        sx={{
          '&': {
            scrollbarGutter: 'stable',
          },
        }}
      >
        <Flex
          flexDir="column"
          borderBottom="1px solid"
          borderBottomColor="border-contrast"
          py={3}
          w="full"
          pl={8}
          bg="background-secondary"
        >
          <HStack w="full" justify="space-between">
            <Text textStyle="B4">Welcome Aboard, {username}!</Text>
            <Link to={RoutesBuilder.home({ account: account_id, env })}>
              <CloseIconButton aria-label="dismiss-onboarding" />
            </Link>
          </HStack>
          <Text textStyle="R7" color="font-secondary">
            Here are some tips and setup tasks to help you get started
          </Text>
        </Flex>
        <Flex flexDir="column" gap={4} w="1100px" alignItems="center">
          <Flex
            w="1100px"
            flexDir="column"
            py={8}
            px={6}
            bg={exoTheme ? 'white' : stepperBGColor}
            gap={4}
            borderRadius={4}
            {...(exoTheme && {
              boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.15)',
            })}
          >
            <StepsHeader onboarding={user?.onboarding} />
            <OnboardingSteps onboarding={user?.onboarding} />
          </Flex>
          <LevelUp />
        </Flex>
      </VStack>
    </Box>
  );
}
