import {
  ExternalLink,
  Flex,
  Grid,
  HStack,
  Icon,
  Image,
  SuccessIcon,
  Text,
  WarningCircle,
} from 'components';
import { ComplexInputField, Input, InputTypes } from 'components/Form';
import {
  imageSrc,
  INVITE_MEMBER,
  ONBOARDING_INVITE,
} from 'containers/Onboarding/consts';
import {
  ICreateUser,
  useInviteUserMutation,
} from 'containers/Settings/Users/users.query';
import { useGetIsAccountThatIsManagedByBoomi } from 'containers/Settings/Users/users.helpers';
import { useUpdateUserOnboardingMutation } from 'containers/Settings/Users/usersV1.query';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';
import { emailValidation } from 'utils/validations';

export function AddUserComponent() {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  const isManagedByBoomi = useGetIsAccountThatIsManagedByBoomi();
  return (
    <Grid templateColumns="6fr 5fr" px={1} gap={5}>
      <Flex flexDir="column" gap={3} color="font">
        {isManagedByBoomi ? (
          <AddUserByBoomiComponent />
        ) : (
          <AddUserByRiveryComponent />
        )}
      </Flex>
      <Image src={imageSrc('invite_a_team_member')} ml={exoTheme && '50%'} />
    </Grid>
  );
}

function AddUserByBoomiComponent() {
  return (
    <>
      <Text textStyle="R7">Want to add your team?</Text>
      <Text>
        To add users to your account, follow your organization's user
        provisioning process.
      </Text>
      <ExternalLink
        url="https://help.boomi.com/docs/Atomsphere/Data_Integration/Administration/user-roles-permissions"
        label="Learn how to add users →"
      />
    </>
  );
}

function AddUserByRiveryComponent() {
  return (
    <>
      <Text textStyle="R7">
        Now it's time to bring in the rest of your team!
      </Text>
      <Text>
        Start inviting your teammates to join your account - <br />
        you can always add more later too.
      </Text>
      <InviteUserForm />
    </>
  );
}

function InviteUserForm() {
  const [message, setMessage] = useState(null);
  const [invite, inviteStatus] = useInviteUserMutation();
  const { selectedAccountId: account_id, userId } = useCore();
  const [update] = useUpdateUserOnboardingMutation();
  const { handleSubmit, ...useFormApi } = useForm<any>({
    defaultValues: {
      user_email: '',
      user_name: '',
      allow_login_password: true,
      allow_login_google: true,
      super_admin: false,
      role: {
        account: 'admin',
      },
    },
    mode: 'onChange',
  });

  const alertSuccess = useCallback(
    async (request, target) => {
      const res = await request;
      if (res?.data?.success) {
        setMessage({
          status: 200,
          text: `You’ve invited ${target} to join Data Integration platform`,
        });
        update({
          account_id,
          user_id: getOId(userId),
          step: { step_key: INVITE_MEMBER, substep_key: ONBOARDING_INVITE },
        });
      }
    },
    [account_id, update, userId],
  );

  const inviteUser = useCallback(
    payload => alertSuccess(invite({ ...payload }), payload.user_email),
    [alertSuccess, invite],
  );

  const onFormSubmit = (formData: ICreateUser) => {
    inviteUser(formData);
  };

  useEffect(() => {
    if (inviteStatus?.isError) {
      setMessage({
        status: 400,
        text:
          (inviteStatus?.error as any)?.data?.message ??
          'Could not complete action',
      });
    }
  }, [inviteStatus]);

  const hasChange = useWatch({
    control: useFormApi.control,
    name: ['user_email', 'user_name'],
  });

  useEffect(() => setMessage(null), [hasChange]);
  return (
    <form style={{ height: '100%' }} onSubmit={handleSubmit(onFormSubmit)}>
      <Flex flexDir="column">
        <Grid templateColumns="1fr 2fr">
          <Input
            hideLabel
            label="Full Name"
            placeholder="First & Last Name"
            name="user_name"
            api={useFormApi}
            required
            chakra
          />
          <ComplexInputField
            inputProps={{
              label: 'Email Address',
              type: InputTypes.EMAIL,
              placeholder: 'Email Address',
              name: 'user_email',
              api: useFormApi,
              required: 'Please enter a valid email address',
              pattern: emailValidation,
              ml: 2,
            }}
            buttonProps={{
              type: 'submit',
              label: 'Invite',
              isLoading: inviteStatus.isLoading,
            }}
          />
        </Grid>
        {message?.status ? (
          <HStack mt={1}>
            <Icon
              mb={0.5}
              boxSize={4}
              as={message.status === 200 ? SuccessIcon : WarningCircle}
            />
            <Text color={message.status === 200 ? 'green.200' : 'red.200'}>
              {message?.text}
            </Text>
          </HStack>
        ) : null}
      </Flex>
    </form>
  );
}
