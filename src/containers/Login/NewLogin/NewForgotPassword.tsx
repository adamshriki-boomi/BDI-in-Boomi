import { API } from 'api';
import {
  Center,
  Flex,
  HStack,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { RecaptchaInput } from 'components/Form/components/RecaptchaInput';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAsyncFn } from 'react-use';
import { LoginRoutes } from '../LoginRoutes';
import {
  Contact,
  ContactSupportWrap,
  EmailAndPassword,
  NewLoginBox,
} from './NewLoginBox';

export function NewForgotPassword({ isReset = false, exoTheme }) {
  const { handleSubmit, setError, ...formHookApi } = useForm<FormProps>();
  const [{ value, loading }, submit] = useAsyncFn(async (formData, recaptcha) =>
    API.auth.forgotPassword(formData, recaptcha),
  );
  const onSubmit = async (data: FormProps) => {
    const { recaptcha, ...formData } = data;
    submit(formData, recaptcha);
  };

  return (
    <NewLoginBox
      header={null}
      {...(!exoTheme && {
        border: '2px',
        borderColor: 'purple.200',
        shadow: 'md',
      })}
    >
      <Center h="full" w="full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <RenderGuard
            condition={value?.status !== 200}
            fallback={
              <Flex flexDir="column" gap={4}>
                <Text textStyle="M5" color="primary">
                  Check your mail
                </Text>
                <Text>
                  We’ve sent an email to{' '}
                  <strong>{formHookApi?.watch('user_email')} </strong>
                  <br />
                  with a link to reset your password.
                </Text>
                <Contact />
              </Flex>
            }
          >
            <Flex flexDir="column" gap={2}>
              <Text textStyle="M5" color="primary">
                Reset your password
              </Text>
              <Text>
                Please enter the email address used to create your account
              </Text>
              <EmailAndPassword formHookApi={formHookApi} emailOnly />
              <RecaptchaInput api={formHookApi} />
              <HStack w="full" justify="space-between" mt={4}>
                <RiveryButton
                  variant="text"
                  label="Back"
                  as={Link}
                  to={LoginRoutes.LOGIN_ROOT}
                />
                <RiveryButton
                  type="submit"
                  label="Reset Password"
                  isLoading={loading}
                  isDisabled={
                    !formHookApi?.watch('user_email') ||
                    !formHookApi?.watch('recaptcha')
                  }
                />
              </HStack>
            </Flex>
          </RenderGuard>
        </form>
      </Center>
    </NewLoginBox>
  );
}

export function NewResetHeaderActions() {
  return <ContactSupportWrap />;
}

type FormProps = {
  user_email: string;
  response;
  recaptcha: string;
};
