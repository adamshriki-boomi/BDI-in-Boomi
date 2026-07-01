import { RoutesBuilder } from 'app/routes';
import {
  Button,
  Center,
  CloseIconButton,
  Flex,
  HStack,
  Icon,
  Image,
  RiveryButton,
  RiveryModal,
  S2TIcon,
  Text,
  useQuery,
} from 'components';
import { ConnectionIcon } from 'containers/AuditLog/icons';
import React, { useCallback } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import { useAccount, useCore } from 'store/core/hooks';
import Congrats from '../../../components/Image/Congratulations-Icon.svg';

export function ConnectionDoneDialog() {
  const { envId, selectedAccountId: accountId } = useCore();
  const query = useQuery();
  const hasParam = query.has('connection_popup');
  const { push } = useHistory();
  const handleOnClose = useCallback(() => push({ search: '' }), [push]);
  const { isSettingOn } = useAccount();
  const createRiverPipeline = useCallback(
    () =>
      push({
        pathname: isSettingOn('allow_create_new_stt')
          ? RoutesBuilder.sourceToTarget({ env: envId, account: accountId })
          : RoutesBuilder.createRiverLegacy({ envId, accountId }),
        search: '?create_first_river=true',
      }),
    [accountId, envId, isSettingOn, push],
  );
  return (
    <RiveryModal headerLess show={Boolean(hasParam)}>
      <Center
        flexDir="column"
        bg="background-secondary"
        gap={4}
        px={6}
        pt={12}
        pb={4}
        borderRadius={4}
      >
        <CloseIconButton
          onClick={handleOnClose}
          aria-label="close"
          position="absolute"
          right="2"
          top="2"
        />
        <Image src={Congrats} />
        <Flex flexDir="column" alignItems="center" gap={2}>
          <Text textStyle="M4" color="purple.300">
            Congrats!
          </Text>
          <Text textStyle="R7">
            You've created a connection. What's your next move?
          </Text>
        </Flex>
        <HStack gap={2} textStyle="R7">
          <Option onAction={handleOnClose}>
            <Icon as={ConnectionIcon} boxSize="22px" />
            <Text>Add Another Connection</Text>
          </Option>
          <Option onAction={createRiverPipeline}>
            <Icon as={S2TIcon} boxSize="22px" />
            <Text>Create Your First Source to Target Flow</Text>
          </Option>
        </HStack>
        <RiveryButton
          label="Return to Onboarding"
          variant="text"
          color="purple.400"
          onClick={() => push(generatePath('/onboarding'))}
        />
      </Center>
    </RiveryModal>
  );
}

function Option({ children, onAction }) {
  return (
    <Flex
      flexDir="column"
      as={Button}
      gap={3}
      border="1px solid"
      borderColor="gray.300"
      borderRadius={4}
      h="115px"
      w="175px"
      whiteSpace="initial"
      textStyle="R7"
      onClick={onAction}
    >
      {children}
    </Flex>
  );
}
