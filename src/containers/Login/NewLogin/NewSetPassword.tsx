import { API } from 'api';
import { Box, Flex, RenderGuard, RiveryButton, Text } from 'components';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { useToggle } from 'react-use';
import { LoginRoutes } from '../LoginRoutes';
import { EmailAndPassword, NewLoginBox } from './NewLoginBox';

export function NewSetPassword({ exoTheme }) {
  const { state } = useLocation<LocationStateData>();
  const { handleSubmit, clearErrors, setError, ...formHookApi } =
    useForm<FormProps>({
      reValidateMode: 'onChange',
    });
  const [passwordSet, togglePasswordSet] = useToggle(false);

  const onSubmit = async (data: FormProps) => {
    clearErrors();
    try {
      const response = await API.auth.callResetPassword({
        ...data,
        token: state?.data.token,
      });
      if (response?.message) {
        togglePasswordSet();
      }
    } catch (error) {
      setError('password', {
        message: error.response?.data.message,
      });
    }
  };

  const isReset = window.location.pathname.includes('reset');
  const text = isReset ? 'Reset Password' : 'Set Password';

  return (
    <NewLoginBox
      header={null}
      {...(!exoTheme && {
        border: '2px',
        borderColor: 'purple.200',
        shadow: 'md',
      })}
    >
      <RenderGuard
        condition={!passwordSet}
        fallback={
          <Flex flexDir="column" gap={6}>
            <Text textStyle="M5" color="primary" textAlign="center">
              Password is updated
            </Text>
            <Text>Your password changed successfully.</Text>
            <RiveryButton
              label="Log In"
              as={Link}
              to={LoginRoutes.LOGIN_ROOT}
            />
          </Flex>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex flexDir="column" gap={6}>
            <Text textStyle="M5" color="primary">
              {text}
            </Text>
            <Text>Please set a new password for your account.</Text>
            <EmailAndPassword
              passwordOnly
              formHookApi={formHookApi}
              withValidation
              login={false}
            />

            <Box>
              <RiveryButton type="submit" label={text} />
            </Box>
          </Flex>
        </form>
      </RenderGuard>
    </NewLoginBox>
  );
}

type FormProps = {
  password: string;
  confirm_password: string;
  isReset?: Boolean;
};
type LocationStateData = {
  data: { token: string };
};
