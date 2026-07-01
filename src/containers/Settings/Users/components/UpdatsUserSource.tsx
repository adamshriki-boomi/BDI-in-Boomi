import { Box, Flex, HStack, Text } from '@chakra-ui/react';
import {
  ConfirmationModal,
  PageOverlaySpinner,
  RenderGuard,
  RiveryInfoTooltip,
} from 'components';
import { RiverySwitch, SwitchComplexLabel } from 'components/Form';
import { useGetTokenQuery } from 'containers/AppSettings/Security/scim.query';
import { useCallback } from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { useUpdateUserSourceMutation } from '../usersV1.query';

export function UpdateUserSource({ user_id, source }) {
  const [displayMode, setDisplayMode] = useToggle(false);
  const [showDisclaimer, toggleShowDisclaimer] = useToggle(false);
  const { activeAccountId: account } = useCore();
  const { data: token } = useGetTokenQuery(
    { account },
    { skip: source !== 'rivery' },
  );
  const [update, { isSuccess, isLoading }] = useUpdateUserSourceMutation();
  const updateUserSource = useCallback(
    () =>
      update({
        account_id: account,
        user_id,
        source: 'active_directory',
      }),
    [account, update, user_id],
  );
  return (
    <RenderGuard condition={token?.is_enabled && source === 'rivery'}>
      {isLoading && <PageOverlaySpinner />}
      <Flex flexDir="column">
        <HStack>
          <Text ml={2} textStyle="M7" color="primary">
            User Provisioning
          </Text>
          <RiveryInfoTooltip description="Associating a local user with a Directory allows you to manage the user and their team memberships from an external directory" />
        </HStack>
        <RiverySwitch
          name="update_user_source"
          isChecked={displayMode}
          onChange={({ target }) => {
            if (target.checked) {
              setDisplayMode(true);
              toggleShowDisclaimer(true);
            } else {
              setDisplayMode(false);
            }
          }}
          label={
            <SwitchComplexLabel
              description=""
              label="Provision from external directory"
            />
          }
          leftLabel
          isDisabled={isSuccess}
          formControlStyle={{ alignItems: 'baseline' }}
          ml="auto"
        />
        <ConfirmationModal
          closeOnOverlayClick={false}
          variant="warning"
          title="User Provisioning"
          confirmLabel="Confirm"
          onConfirm={updateUserSource}
          onClose={toggleShowDisclaimer}
          onCancel={() => setDisplayMode(false)}
          show={showDisclaimer}
        >
          <Flex flexDir="column" gap={2}>
            <Box>
              By proceeding, you will associate this local user with a Directory
              user. This allows you to manage the user and their team
              memberships from an external directory.
            </Box>
            Please note that this action is irreversible and will change the
            user’s source to ‘Directory’, adjusting their teams and permissions
            based on the Directory settings.
          </Flex>
        </ConfirmationModal>
      </Flex>
    </RenderGuard>
  );
}
