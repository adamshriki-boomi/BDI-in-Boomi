import { InputGroup, InputRightElement } from '@chakra-ui/react';
import {
  Box,
  CheckmarkSolid,
  ConfirmationModal,
  CopyIcon,
  Flex,
  HStack,
  Icon,
  RiveryButton,
  RiveryModal,
  Text,
} from 'components';
import { Input } from 'components/Form';
import SvgProvisioning from 'components/Icons/components/Provisioning';
import { useCopyToClipboardWithToast } from 'hooks/useCopyToClipboard';
import { useToastComponent } from 'hooks/useToast';
import { useCallback, useEffect, useMemo } from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import GenericComponent from './GenericComponent';
import {
  useDeleteTokenMutation,
  useGenerateTokenMutation,
  useGetTokenQuery,
} from './scim.query';

export default function SCIMConfiguration() {
  const { activeAccountId: account } = useCore();
  const { data: token } = useGetTokenQuery({ account });
  const Button = useMemo(() => {
    if (!token) {
      return null;
    }
    if (token?.is_enabled) {
      return <StopSync />;
    }
    return <GenerateToken />;
  }, [token]);
  return (
    <GenericComponent
      icon={SvgProvisioning}
      title="Users and Groups Provisioning"
      text="Automate and manage users and teams through your organization’s identity provider using SCIM"
      href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Administration/microsoft-entra-id-provisioning-of-users-and-teams"
      showContactUs={false}
      component={<Box mt={2}>{Button}</Box>}
    />
  );
}

function StopSync() {
  const { activeAccountId: account } = useCore();
  const [show, toggle] = useToggle(false);
  const [deleteToken] = useDeleteTokenMutation({});
  const stopSync = useCallback(() => {
    deleteToken({ account });
  }, [account, deleteToken]);
  return (
    <>
      <HStack>
        <RiveryButton
          colorScheme="danger"
          label="Revoke Token"
          variant="primary"
          onClick={toggle}
        />
        <HStack>
          <Icon mb={1} as={CheckmarkSolid} />
          <Text>Token is issued</Text>
        </HStack>
        <ConfirmationModal
          show={show}
          variant="warning"
          onClose={() => toggle(false)}
          title="Revoke Token"
          confirmLabel="Revoke Token"
          confirmColorScheme="primary"
          onCancel={() => toggle(false)}
          onConfirm={stopSync}
          description="Revoking the token will stop the sync and intercept the connection with your identity provider. To resume the connection, you'll need to apply a new token."
        />
      </HStack>
    </>
  );
}

function GenerateToken() {
  const { error: showError } = useToastComponent();
  const { activeAccountId: account } = useCore();
  const [show, toggle] = useToggle(false);
  const [generate, { data, isError, error }] = useGenerateTokenMutation();
  const { refetch } = useGetTokenQuery({ account });
  const generateToken = useCallback(() => {
    generate({ account });
  }, [account, generate]);

  const onDone = useCallback(() => {
    refetch();
    toggle(false);
  }, [refetch, toggle]);

  useEffect(() => {
    if (isError) {
      showError({
        duration: 50000,
        description: `Failed to generate token. ${
          (error as any)?.data?.detail
        }`,
      });
    }
    if (data) {
      toggle(true);
    }
  }, [isError, toggle, data, error, showError]);

  return (
    <>
      <RiveryModal
        show={show}
        onClose={() => toggle(false)}
        modalProps={{ closeOnOverlayClick: false }}
        title="SCIM Access Token Generator"
        style={{ header: { py: 2, px: 6 } }}
        footer={{
          cancelLabel: null,
          saveLabel: (
            <RiveryButton
              size="small"
              variant="primary"
              onClick={onDone}
              label="Done"
            />
          ),
        }}
      >
        <Flex p={6} flexDir="column" gap={3}>
          <Text>
            Before closing this window, please copy and store this token, as it
            will only be visible once for security reasons.
          </Text>
          <SCIMInputs label="Service URL" value={data?.scim_service_url} />
          <SCIMInputs label="Token Value" value={data?.token} />
        </Flex>
      </RiveryModal>
      <RiveryButton label="Generate Token" onClick={generateToken} />
    </>
  );
}

function SCIMInputs({ value, label }) {
  const { copyToClipboard } = useCopyToClipboardWithToast();
  return (
    <InputGroup>
      <Input readOnly chakra value={value} label={label} />
      <InputRightElement mt={4}>
        <Icon
          as={CopyIcon}
          role="button"
          onClick={() => copyToClipboard(value)}
          bg="background-secondary"
        />
      </InputRightElement>
    </InputGroup>
  );
}
