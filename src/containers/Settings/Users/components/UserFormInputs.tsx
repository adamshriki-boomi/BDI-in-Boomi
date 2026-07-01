import { Flex, RenderGuard, Text } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { Input, InputTypes } from 'components/Form';
import {
  RiveryCheckbox,
  RiverySwitch,
  SwitchComplexLabel,
} from 'components/Form/components';
import { RiveryRadioGroup } from 'components/Form/components/RiveryRadioGroup';
import { useEffect, useMemo } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useAccount, useCore } from 'store/core';
import { emailValidation } from 'utils/validations';
import { useGetIsAccountThatIsManagedByBoomi } from '../users.helpers';

export function UserDetailsInput({ ...props }) {
  return <Input required chakra size="md" {...props} />;
}

export function NameAndEmail({ useFormApi, user }) {
  return (
    <Flex flexDir="column" gap={5}>
      <UserDetailsInput
        label="Full Name"
        placeholder="Full Name"
        name="user_name"
        api={useFormApi}
        disabled={Boolean(user?.user_id)}
      />
      <UserDetailsInput
        label="Email Address"
        type={InputTypes.EMAIL}
        placeholder="Email Address"
        name="user_email"
        disabled={Boolean(user?.user_id)}
        api={useFormApi}
        required="Please enter a valid email address"
        pattern={emailValidation}
      />
    </Flex>
  );
}

export function LoginTypeCheckboxes({ user }) {
  const useFormApi = useFormContext();
  const { isSuperAdminCreator } = useCore();
  const { isSettingOn } = useAccount();
  const boomi_sso_account = useGetIsAccountThatIsManagedByBoomi();

  const manageUsersBySsoOnly = isSettingOn('manage_users_by_sso_only');
  const isSuperAdminsAccount = isSettingOn('super_admins_account');

  const hideUserLoginTypes =
    (user?.source === 'active_directory' && manageUsersBySsoOnly) ||
    boomi_sso_account;
  const isRiveryEmail = useFormApi
    .watch('user_email')
    ?.match(/@rivery.io|@boomi.com$/);
  const shouldClearSuperAdminCheck =
    !user && !isRiveryEmail && useFormApi.getValues('super_admin');

  useEffect(() => {
    if (shouldClearSuperAdminCheck) {
      useFormApi.setValue('super_admin', false);
    }
  }, [shouldClearSuperAdminCheck, useFormApi]);

  const { field: superAdminField } = useController({
    name: 'super_admin',
    control: useFormApi.control,
  });

  const { field: globalOperatorField } = useController({
    name: 'global_operator',
    control: useFormApi.control,
  });

  const onSetAdvancedRole = (role: string) => {
    if (role === 'super_admin') {
      superAdminField.onChange(true);
      globalOperatorField.onChange(false);
    } else {
      superAdminField.onChange(false);
      globalOperatorField.onChange(true);
    }
  };

  const advancedRoleValue = useMemo(() => {
    if (isRiveryEmail) {
      if (superAdminField.value) {
        return 'super_admin';
      } else if (globalOperatorField.value) {
        return 'global_operator';
      }
    }
    return '';
  }, [globalOperatorField.value, isRiveryEmail, superAdminField.value]);

  const { field: superAdminCreator } = useController({
    name: 'super_admin_creator',
    control: useFormApi.control,
  });

  const { field: globalOp } = useController({
    name: 'global_operator',
    control: useFormApi.control,
  });

  return (
    <Flex flexDir="column" gap={2} pl={1} pt={3}>
      <RenderGuard condition={!hideUserLoginTypes}>
        <RiveryCheckbox
          api={useFormApi}
          name="allow_login_password"
          label="Enable login with email and password"
          aria-label={`check-${user?.user_name}-password`}
        />
      </RenderGuard>
      <RenderGuard condition={!hideUserLoginTypes}>
        <RiveryCheckbox
          api={useFormApi}
          name="allow_login_google"
          label="Enable login with google account"
          aria-label={`check-${user?.user_name}-google`}
        />
      </RenderGuard>
      {user?.allow_login_sso && (
        <RiveryCheckbox
          isChecked
          isDisabled
          name="allow_login_sso"
          label="Enable login with sso"
          aria-label={`check-${user?.user_name}-sso`}
        />
      )}
      <RenderGuard
        condition={
          isSuperAdminsAccount && isSuperAdminCreator && !hideUserLoginTypes
        }
      >
        <Flex flexDir="column" mt={4} gap={2}>
          <Text textStyle="M7" color="primary">
            Advanced Roles for Boomi Users
          </Text>
          <Flex
            flexDir="column"
            gap={2}
            px={2}
            py={3}
            borderRadius={4}
            bg="background-selected-weak"
          >
            <RiveryRadioGroup
              onChange={onSetAdvancedRole}
              value={advancedRoleValue}
              defaultValue={isRiveryEmail ? 'super_admin' : ''}
              values={[
                {
                  isDisabled: !isRiveryEmail,
                  label: 'Super Admin',
                  value: 'super_admin',
                  description: 'Full access to all accounts.',
                },
                {
                  isDisabled: !isRiveryEmail,
                  label: 'Global Operator',
                  value: 'global_operator',
                  description:
                    'Access to all accounts as viewer, perform update account operations only.',
                },
              ]}
            />
            <RiverySwitch
              formControlStyle={{ alignItems: 'baseline' }}
              isChecked={superAdminCreator.value}
              isDisabled={!isRiveryEmail || Boolean(globalOp.value)}
              name="super_admin_creator"
              label={
                <SwitchComplexLabel
                  label="Super Admin Creator"
                  labelStyle={{ fontWeight: '600' }}
                  description="User can invite new Super Admins and Global Operators."
                />
              }
              api={useFormApi}
              leftLabel
              ml="auto"
            />
          </Flex>
        </Flex>
      </RenderGuard>
      <RenderGuard
        condition={
          isRiveryEmail && !isSuperAdminsAccount && isSuperAdminCreator
        }
      >
        <RiveryAlert
          variant="warning-light"
          description="To set user as Super Admin or Global Operator login to the InternalAdminManagement account"
        />
      </RenderGuard>
    </Flex>
  );
}
