import { Flex, Icon, Text, useDisclosure } from '@chakra-ui/react';
import { ConfirmationModal, Grid } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Input } from 'components/Form';
import { useToastComponent } from 'hooks/useToast';
import { useDeleteAccountMutation } from 'modules/AccountPicker';
import React, { useState } from 'react';
import { BiTrash } from 'react-icons/bi';
import { useCore } from 'store/core';

export const DeleteAccountModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAccountBlocked } = useCore();
  return isAccountBlocked ? (
    <>
      <DeleteModalContent show={isOpen} onClose={onClose} />
      <RiveryButton
        label="Delete Account"
        variant="primary"
        colorScheme="danger"
        leftIcon={<Icon as={BiTrash} alignItems="center" />}
        onClick={onOpen}
      />
    </>
  ) : null;
};

function DeleteModalContent({ show, onClose }) {
  const [value, setValue] = useState(null);
  const { success, error } = useToastComponent();
  const { selectedAccountId } = useCore();

  const [deleteAccount, { isError }] = useDeleteAccountMutation();
  const deleteRegex = new RegExp(/^delete$/);
  const onConfirm = () => {
    deleteAccount(selectedAccountId).then(() => {
      if (!isError) {
        success({ description: 'The account has been deleted successfully' });
        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 3000);
      } else {
        error({ description: 'Something went wrong.' });
      }
    });
  };
  return (
    <ConfirmationModal
      title="Delete Account?"
      variant="error"
      confirmLabel="Delete"
      confirmProps={{
        isDisabled: !deleteRegex.test(value),
      }}
      onConfirm={onConfirm}
      onClose={onClose}
      show={show}
    >
      <Grid gap={2} flexDirection="column">
        <Flex gap={2} flexDir="column">
          <Text display="flex" fontSize="sm">
            This action will permanently Delete this account with all of his
            environments
          </Text>
          <Text display="flex" fontSize="sm" pb={3}>
            Please be aware that once the Objects are deleted, they cannot be
            recovered.
          </Text>
          <Input
            label="Type 'delete' to confirm"
            placeholder="Type..."
            value={value}
            onChange={({ target }) => setValue(target.value)}
          />
        </Flex>
      </Grid>
    </ConfirmationModal>
  );
}
