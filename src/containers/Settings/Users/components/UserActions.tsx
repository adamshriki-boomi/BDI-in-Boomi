import {
  CheckIcon,
  CloseIconSmall,
  ConfirmationModal,
  DeleteIcon,
  EditIcon,
  Flex,
  Icon,
  ResetPass,
  Text,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { useToastComponent } from 'hooks/useToast';
import { useCallback, useEffect, useState } from 'react';
import { useCopyToClipboard, useToggle } from 'react-use';
import { useCore } from 'store/core';
import { ReactComponent as SendIcon } from '../icons/send.svg';
import { useGetIsAccountThatIsManagedByBoomi } from '../users.helpers';
import {
  useDeleteUserMutation,
  useEditUserMutation,
  useReInviteUserMutation,
  useResetPasswordAdminMutation,
} from '../users.query';

enum UserActionsTypes {
  RESET_PASSWORD = 'reset_password',
  DELETE = 'delete',
  DEACTIVATE = 'deactivate',
}

function UsersActionsMenuItem({ text, icon }) {
  return (
    <Flex alignItems="center">
      <Icon as={icon} boxSize="18px" mr={2} mb={0.5} />
      <Text>{text}</Text>
    </Flex>
  );
}

export default function UserActions({
  row: {
    original: { user_email, status, user_id },
  },
  row,
  column: { getProps },
}) {
  const isBoomiAccount = useGetIsAccountThatIsManagedByBoomi();
  const { isSuperAdminUser } = useCore();
  const { userEmail } = useCore();
  const [, copyToClipboard] = useCopyToClipboard();

  const { success, error } = useToastComponent();
  const statusPending = ['Invitation pending', 'pending'].includes(status);
  const statusActive = ['active'].includes(status.toLowerCase());
  const [showConfirmationModal, toggleConfirmationModal] = useToggle(false);
  const [currentAction, setCurrentAction] = useState<UserActionsTypes>(null);
  const [deleteUser, { isSuccess: userDeleted, isLoading: isDeleting }] =
    useDeleteUserMutation();
  const [resetPassword, { data: passwordResetLink, isLoading: isReseting }] =
    useResetPasswordAdminMutation();
  const [reInviteUser, { isSuccess: userReInvited, isLoading: isResending }] =
    useReInviteUserMutation();
  const [edit, { isLoading: isEditing, isSuccess: userStatusChanged }] =
    useEditUserMutation();

  const userAction = action => {
    setCurrentAction(action);
    toggleConfirmationModal(true);
  };

  const handleActionSuccess = useCallback(
    description => {
      success({ description });
      toggleConfirmationModal(false);
    },
    [success, toggleConfirmationModal],
  );

  const isFromActiveDirectory = row?.original?.source === 'active_directory';
  const editUserAction = [
    {
      value: <UsersActionsMenuItem text="Edit" icon={EditIcon} />,
      onClick: () => getProps?.setSelectedUser(row?.original),
    },
  ];
  const actions = [
    ...editUserAction,
    isSuperAdminUser &&
      !isBoomiAccount &&
      !row?.original.super_admin && {
        value: <UsersActionsMenuItem text="Reset Password" icon={ResetPass} />,
        onClick: () => userAction(UserActionsTypes.RESET_PASSWORD),
      },
    !statusPending
      ? !isBoomiAccount && {
          value: statusActive ? (
            <UsersActionsMenuItem text="Deactivate" icon={CloseIconSmall} />
          ) : (
            <UsersActionsMenuItem text="Activate" icon={CheckIcon} />
          ),
          onClick: () => userAction(UserActionsTypes.DEACTIVATE),
        }
      : !isBoomiAccount && {
          value: <UsersActionsMenuItem text="Resend" icon={SendIcon} />,
          onClick: () => reInviteUser({ _id: { $oid: user_id } }),
        },
    !isBoomiAccount && {
      value: <UsersActionsMenuItem text="Delete" icon={DeleteIcon} />,
      onClick: () => userAction(UserActionsTypes.DELETE),
    },
  ].filter(Boolean);

  useEffect(
    () =>
      getProps?.setPending(
        isDeleting || isResending || isEditing || isReseting,
      ),
    [getProps, isDeleting, isEditing, isResending, isReseting],
  );

  useEffect(() => {
    if (userDeleted) {
      handleActionSuccess('User was deleted');
      getProps?.toggleRefetch(true);
    }
    if (userStatusChanged) {
      handleActionSuccess('User status was changed');
      getProps?.toggleRefetch(true);
    }
    if (userReInvited) {
      handleActionSuccess('Invitation Sent');
    }
    if (passwordResetLink) {
      copyToClipboard(passwordResetLink?.confirm_url);
      handleActionSuccess(
        'The reset password link was copied to your clipboard',
      );
    }
  }, [
    handleActionSuccess,
    userDeleted,
    userReInvited,
    userStatusChanged,
    passwordResetLink,
    copyToClipboard,
    getProps,
  ]);

  const actionType = statusActive ? 'deactivate' : 'activate';
  const currentUser = user_email === userEmail;

  const config = {
    [UserActionsTypes.DELETE]: {
      title: 'Please Confirm Delete',
      content: `Are you sure you want to delete ${user_email}?`,
      onConfirm: () =>
        deleteUser({
          _id: { $oid: user_id },
          cross_account_delete: false,
        }).then((res: any) => {
          if (res?.error) {
            error({ description: res?.error?.data?.message });
          }
        }),
      confirmLabel: 'Delete',
      confirmColorScheme: 'danger',
      footerExtraButtons: () => (
        <DeleteUserFooter
          deleteUser={deleteUser}
          id={user_id}
          isLoading={isDeleting}
        />
      ),
    },
    [UserActionsTypes.RESET_PASSWORD]: {
      title: `Are you sure you would like to reset ${user_email} password?ֿ`,
      content: 'This action will send the user a reset password email',
      onConfirm: () => resetPassword({ user_email }),
      confirmLabel: 'Reset',
      confirmColorScheme: 'info',
      footerExtraButtons: () => null,
    },
    [UserActionsTypes.DEACTIVATE]: {
      title: `${actionType} User`,
      content: `Are you sure you want to ${actionType} ${user_email}?`,
      onConfirm: () =>
        edit({
          _id: { $oid: user_id },
          is_active: !statusActive,
          terminate_current_sessions: true,
        }).then((res: any) => {
          if (res?.error) {
            error({ description: res?.error?.data?.message });
          }
        }),
      confirmLabel: actionType,
      confirmColorScheme: statusActive ? 'danger' : 'primary',
      footerExtraButtons: () => null,
    },
  };

  const currentConfig = config?.[currentAction];

  if (isFromActiveDirectory) {
    return null;
  }
  return (
    <>
      <ConfirmationModal
        show={showConfirmationModal}
        onClose={toggleConfirmationModal}
        onConfirm={currentConfig?.onConfirm}
        title={<Text textTransform="capitalize">{currentConfig?.title}</Text>}
        variant="error"
        footerExtraButtons={currentConfig?.footerExtraButtons()}
        confirmLabel={currentConfig?.confirmLabel}
        confirmColorScheme={currentConfig?.confirmColorScheme}
      >
        {currentConfig?.content}
      </ConfirmationModal>
      <RiveryDropdown
        isLazy
        menuButtonDisabled={currentUser}
        menuItems={actions}
        menuButtonAriaLabel={`users-menu-${row.id}`}
        useAsPortal={!getProps.teamsDrawer}
      />
    </>
  );
}

function DeleteUserFooter({ deleteUser, id, isLoading }) {
  const { isSuperAdminUser } = useCore();

  return isSuperAdminUser ? (
    <RiveryButton
      label="Delete from all accounts"
      variant="outlined-primary"
      colorScheme="danger"
      isLoading={isLoading}
      onClick={() =>
        deleteUser({ _id: { $oid: id }, cross_account_delete: true })
      }
    />
  ) : null;
}
