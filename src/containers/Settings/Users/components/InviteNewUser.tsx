import { chakra, DrawerFooter, Icon } from '@chakra-ui/react';
import {
  Box,
  ConfirmationModal,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  HStack,
  LockClosed,
  RenderGuard,
  RiveryModalProps,
  Text,
  useDisclosure,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import RiveryButton, { CloseIconButton } from 'components/Buttons/RiveryButton';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { useFocusFirstField } from 'hooks/useFocusFirstField';
import { useToastComponent } from 'hooks/useToast';
import { ChevronLeftIcon } from 'layout/Sidebar/components/SubComponents';
import { useGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAccount, useCore } from 'store/core';
import { assignEnvironments, userDefaultValues } from '../users.helpers';
import {
  buildPrivilegedUserPayload,
  createUserPayload,
  ICreateUser,
  shouldUsePrivilegedUserEndpoint,
  useEditUserMutation,
  useInviteUserMutation,
} from '../users.query';
import {
  useAddPrivilegedUserMutation,
  useGetSingleUserPermissionsQuery,
  useGetSingleUserQuery,
} from '../usersV1.query';
import EnvironmentsTable from './EnvironmentsTable';
import { UpdateUserSource } from './UpdatsUserSource';
import { LoginTypeCheckboxes, NameAndEmail } from './UserFormInputs';
import { UsersDrawerTabs } from './UsersDrawerTabs';
interface UsersModalProps extends RiveryModalProps {
  user: any;
  refetch: any;
}

export function UsersDrawer({ user, refetch, ...rest }: UsersModalProps) {
  const { isSettingOn } = useAccount();
  const isSuperAdminsAccount = isSettingOn('super_admins_account');

  return (
    <Drawer
      variant={isSuperAdminsAccount ? 'small' : 'semifull'}
      placement="right"
      onClose={rest.onClose}
      isOpen={rest.show}
    >
      <DrawerOverlay />
      <DrawerContent
        transition="transform 0.1s !important"
        transitionTimingFunction="linear !important"
      >
        <UserDrawerForm
          userID={user?.user_id}
          onClose={rest.onClose}
          disabled={user?.source === 'active_directory'}
          refetch={refetch}
        />
      </DrawerContent>
    </Drawer>
  );
}

const useModalConfirmationEditUser = editUser => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [payload, setPayload] = useState({});
  const editConfirmationModal = payload => {
    setPayload(payload);
    onToggle();
  };
  return {
    editConfirmationModal,
    ConfirmUpdateModal: () => (
      <ConfirmationModal
        title="Apply Changes"
        description="The changes you have set will apply immediately and affect only the future user’s sessions. <br/ >
Do you prefer to end the user's current sessions now or have them experience the changes upon their next login?"
        onConfirm={() =>
          editUser({ ...payload, terminate_current_sessions: false })
        }
        onCancel={() =>
          editUser({ ...payload, terminate_current_sessions: true })
        }
        cancelLabel="End Sessions Now"
        confirmColorScheme="primary"
        confirmLabel="Keep Until Next Login"
        onClose={onClose}
        variant="info"
        show={isOpen}
      />
    ),
  };
};

export function UserDrawerForm({
  userID: user_id,
  onClose,
  disabled = false,
  setUser = null,
  refetch = null,
  //Is it rendered inside the teams drawer
  teamsView = false,
}) {
  const { isSettingOn } = useAccount();
  const { activeAccountId: account_id } = useCore();
  const {
    data: permissions,
    isFetching: pFetching,
    isError: couldntFetchPermissions,
  } = useGetSingleUserPermissionsQuery({ user_id, account_id } as any, {
    skip: !user_id,
  });
  const { data: user, isFetching } = useGetSingleUserQuery(
    { user_id, account_id } as any,
    {
      skip: !permissions || !user_id,
    },
  );

  const modalTitle = disabled
    ? 'User Info'
    : user_id
    ? 'Edit User'
    : 'Add User';
  const { success, error } = useToastComponent();
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const environments = assignEnvironments(user, permissions, environmentsArray);
  const { isSuperAdminCreator } = useCore();
  const isSuperAdminsAccount = isSettingOn('super_admins_account');
  const [invite, inviteStatus] = useInviteUserMutation();
  const [edit, editStatus] = useEditUserMutation();
  const [addPrivileged, addPrivilegedStatus] = useAddPrivilegedUserMutation();

  const formApi = useForm<any>({
    defaultValues: userDefaultValues(Boolean(user_id), user, environments),
    mode: 'onChange',
  });

  const { handleSubmit, ...useFormApi } = formApi;

  useEffect(() => {
    if (user && useFormApi?.watch('user_email') !== user?.user_email) {
      useFormApi.reset(userDefaultValues(Boolean(user_id), user, environments));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const alertSuccess = useCallback(
    async (request, target, action) => {
      const res = await request;
      const data = res?.data as { success?: boolean; user_email?: string };
      // users_management invite/edit returns { success: true }
      const isUsersManagementSuccess = data?.success === true;
      // v1 user endpoints return the saved user (e.g. POST .../users/privileged)
      const isUserEntityResponse =
        Boolean(data?.user_email) && data?.success !== false;
      if (isUsersManagementSuccess || isUserEntityResponse) {
        success({ description: `${target} was ${action}` });
        refetch();
      }
    },
    [refetch, success],
  );

  const inviteUser = useCallback(
    payload =>
      alertSuccess(invite({ ...payload }), payload.user_email, 'Invited'),
    [alertSuccess, invite],
  );

  const editUser = useCallback(
    payload =>
      alertSuccess(
        edit({ ...payload, _id: { $oid: user?.user_id } }),
        payload.user_email,
        'Edited',
      ),
    [alertSuccess, edit, user?.user_id],
  );
  const { editConfirmationModal, ConfirmUpdateModal } =
    useModalConfirmationEditUser(editUser);

  const savePrivilegedUser = useCallback(
    async (formData: ICreateUser) => {
      const body = buildPrivilegedUserPayload(formData, isSuperAdminCreator);
      try {
        await addPrivileged({ account_id, ...body }).unwrap();
        success({
          description: `${body.user_email} was ${
            user_id ? 'updated' : 'invited'
          }`,
        });
      } catch (e: any) {
        const detail = e?.data?.detail;
        const message = Array.isArray(detail)
          ? detail
              .map((d: { msg?: string }) => d.msg)
              .filter(Boolean)
              .join(', ')
          : typeof detail === 'string'
          ? detail
          : e?.data?.message ?? e?.message;
        error({
          description: message ?? 'Could not complete action',
        });
      }
    },
    [account_id, addPrivileged, error, isSuperAdminCreator, success, user_id],
  );

  const onFormSubmit = (formData: ICreateUser) => {
    if (shouldUsePrivilegedUserEndpoint(isSuperAdminsAccount, formData)) {
      void savePrivilegedUser(formData);
      return;
    }
    const payload = createUserPayload(formData, isSuperAdminCreator);
    user ? editConfirmationModal(payload) : inviteUser(payload);
  };

  useEffect(() => {
    if (inviteStatus?.isError || editStatus?.isError) {
      error({
        description:
          ((inviteStatus.error as any)?.data.message ||
            (editStatus.error as any)?.data.message) ??
          'Could not complete action',
      });
    }
  }, [editStatus, error, inviteStatus]);

  useEffect(() => {
    if (
      inviteStatus.isSuccess ||
      editStatus.isSuccess ||
      addPrivilegedStatus.isSuccess
    ) {
      onClose();
      refetch();
    }
  }, [
    addPrivilegedStatus.isSuccess,
    editStatus,
    inviteStatus,
    onClose,
    refetch,
  ]);

  useEffect(() => {
    if (couldntFetchPermissions) {
      error({ description: 'Could not fetch user permissions' });
    }
  }, [couldntFetchPermissions, error]);

  useFocusFirstField(useFormApi, 'user_name');
  return (
    <>
      <RenderGuard
        condition={[
          isFetching,
          pFetching,
          inviteStatus.isLoading,
          editStatus.isLoading,
          addPrivilegedStatus.isLoading,
        ].some(Boolean)}
      >
        <PageOverlaySpinner />
      </RenderGuard>
      <ConfirmUpdateModal />
      <FormProvider {...formApi}>
        <form style={{ height: '100%' }} onSubmit={handleSubmit(onFormSubmit)}>
          <Grid h="full" gridTemplateRows="auto 1fr auto">
            <DrawerHeader pb={0} w="full">
              <HStack
                justify="space-between"
                borderBottom="1px solid var(--chakra-colors-gray-300)"
              >
                <Text textStyle="M4">{modalTitle}</Text>
                <CloseIconButton
                  onClick={onClose}
                  aria-label="close dataframes"
                />
              </HStack>
            </DrawerHeader>
            <DrawerBody py={0} pr={isSuperAdminsAccount ? 3 : 0}>
              <Grid
                templateColumns={isSuperAdminsAccount ? '280px' : '300px auto'}
                gap={1}
                overflow="hidden"
                h="100%"
              >
                <Grid
                  templateRows="repeat(4, min-content)"
                  gap={4}
                  bg="background-secondary"
                  borderRight={isSuperAdminsAccount ? '0px' : '1px'}
                  borderRightColor="gray.300"
                  p={3}
                >
                  <ContentWrapper disabled={disabled}>
                    <NameAndEmail useFormApi={useFormApi} user={user} />
                  </ContentWrapper>
                  <ContentWrapper disabled={disabled}>
                    <LoginTypeCheckboxes user={user} />
                  </ContentWrapper>
                  <UpdateUserSource
                    user_id={user?.user_id}
                    source={user?.source}
                  />
                  <RenderGuard condition={user?.source === 'active_directory'}>
                    <RiveryAlert
                      mt={4}
                      icon={LockClosed}
                      variant="info"
                      description="This user is provisioned and synced from external directory."
                    />
                  </RenderGuard>
                </Grid>
                <RenderGuard condition={!isSuperAdminsAccount}>
                  <RenderGuard
                    condition={isSettingOn('allow_AD_users')}
                    fallback={
                      <Box p={3}>
                        <EnvironmentsTable formApi={useFormApi} userView />
                      </Box>
                    }
                  >
                    <UsersDrawerTabs
                      disableTeams={!user?.groups}
                      formApi={useFormApi}
                    />
                  </RenderGuard>
                </RenderGuard>
              </Grid>
            </DrawerBody>
            <RenderGuard
              condition={!teamsView}
              fallback={
                <DrawerFooter
                  borderTop="1px solid"
                  borderColor="gray.300"
                  justifyContent="space-between"
                >
                  <RiveryButton
                    label="Back"
                    variant="text"
                    size="small"
                    leftIcon={<Icon as={ChevronLeftIcon} />}
                    onClick={() => setUser(null)}
                  />
                </DrawerFooter>
              }
            >
              <RiveryDrawerFooter
                cancelLabel="Cancel"
                saveLabel={user ? 'Apply Changes' : 'Add User'}
                handleOnClose={onClose}
                disabledSave={!useFormApi.formState.isValid || disabled}
                handleOnSuccess={() => null}
              />
            </RenderGuard>
          </Grid>
        </form>
      </FormProvider>
    </>
  );
}

function ContentWrapper({ children, disabled }) {
  return disabled ? (
    <chakra.fieldset display="contents" disabled>
      {children}
    </chakra.fieldset>
  ) : (
    children
  );
}
