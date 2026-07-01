import { API } from 'api';
import {
  Box,
  Flex,
  HStack,
  Icon,
  RiveryModal,
  Text,
  useDisclosure,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Input } from 'components/Form';
import { ExclamationInfoFilled } from 'components/Icons';
import { useToastComponent } from 'hooks/useToast';
import React, { useState } from 'react';
import { validateEmail } from 'utils/validations';

type Props = {
  dsId: string;
};

function ShareLinkModalContent({ shareUrl, email, onChangeEmail }) {
  return (
    <Flex flexDir="column" gap="4">
      <Text color="font-secondary" fontSize="small" textAlign="left">
        Send/Copy a unique link to create a connection by external user.
      </Text>
      <Input
        aria-label="email to"
        placeholder="Email"
        required="Please enter a valid email address"
        value={email}
        onChange={val => {
          onChangeEmail(val?.target?.value);
        }}
        chakra
      />
      <Input
        chakra
        aria-label="copy share link"
        type="copy"
        label=""
        value={shareUrl}
        onChange={() => null}
      />
    </Flex>
  );
}

export function ShareLink({ dsId }: Props) {
  const { success } = useToastComponent();
  const [email, setEmail] = useState('');
  const isValidEmail = validateEmail(email);
  const [shareUrl, setShareUrl] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const onModalOpen = () => {
    onOpen();
    getConnectionLink();
  };
  const onSend = () => {
    API.connections.postShareLink(dsId, email).then(res => {
      success({ description: 'The email has been sent' });
    });
  };
  const getConnectionLink = async () => {
    const res = await API.connections.shareCreationLink(dsId);
    setShareUrl(res?.url);
  };

  return (
    <Box pr={4}>
      <HStack fontSize="sm" mb={2}>
        <Icon
          as={ExclamationInfoFilled}
          color="background-info-strong"
          h={4}
          w={4}
          mr={0.5}
        />
        <Text color="font-secondary" marginInlineStart="0px!important">
          Missing Details?
        </Text>
        <RiveryButton
          label="Send External Link"
          variant="link"
          fontSize="sm"
          ml={1}
          mr={6}
          fontWeight="medium"
          onClick={onModalOpen}
        />
      </HStack>
      <RiveryModal
        show={isOpen}
        onClose={onClose}
        centered
        footer={{
          saveLabel: 'Send',
        }}
        title="Add Connection By External User"
        body={
          <ShareLinkModalContent
            shareUrl={shareUrl}
            email={email}
            onChangeEmail={setEmail}
          />
        }
        onSuccess={() => {
          if (isValidEmail) {
            onSend();
            onClose();
          }
        }}
      />
    </Box>
  );
}
