import { Icon, useDisclosure } from '@chakra-ui/react';
import { ConfirmationModal } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { useRefreshAccountToken } from 'hooks/useRefreshAccountToken';
import React, { useCallback } from 'react';
import { BiBlock } from 'react-icons/bi';
import { useCore, useCoreActions } from 'store/core';

export const BlockAccountModal = () => {
  const { refreshAccountToken } = useRefreshAccountToken();

  const { blockAccount: block } = useCoreActions();
  const { activeAccountName, isAccountInTrial, isAccountTypeActive } =
    useCore();
  const showBlockAccount = isAccountInTrial || isAccountTypeActive;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const blockAccount = useCallback(async () => {
    await block();
    refreshAccountToken();
  }, [block, refreshAccountToken]);

  return showBlockAccount ? (
    <>
      <ConfirmationModal
        key="Block Account"
        title="Block Account"
        description={`Are you Sure you want to block "${activeAccountName}" account ?`}
        onConfirm={blockAccount}
        onClose={onClose}
        variant="error"
        show={isOpen}
      />
      <RiveryButton
        label="Block Account"
        variant="outlined-primary"
        colorScheme="danger"
        leftIcon={<Icon as={BiBlock} alignItems="center" />}
        onClick={onOpen}
      />
    </>
  ) : null;
};
