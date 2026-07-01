import {
  Box,
  Divider,
  ExternalLink,
  Flex,
  HStack,
  RenderGuard,
  Text,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useEffectOnce, useToggle } from 'react-use';
import { useDispatch } from 'react-redux';
import { useCore, useCoreActions } from 'store/core';
import { GoogleSignIn } from '../components/GoogleSignIn';
import { Or } from '../components/Or';
import { useLoginFromParams } from '../containers/hooks/useLoginFromParams';
import { LoginRoutes } from '../LoginRoutes';
import {
  ContactSupportWrap,
  EmailAndPassword,
  ErrorBox,
  NewLoginBox,
} from './NewLoginBox';
import queryString from 'query-string';
import { GetStartedWithBoomi } from '../components/GetStartedWithBoomi';

type CredentialsProps = {
  user_email: string;
  password: string;
};

const LOGIN_DEFAULT_ERROR =
  'The email address and/or password you entered did not match our records.\n' +
  '      Please double-check and try again.';

function SelectView() {
  useAuthSuccessRedirect();
  return null;
}

const useGetSignupLink = () => {
  // const isProd = isProdDomain(Regions.US);
  const websiteSignup = 'https://rivery.io/free-trial';
  // const { boomiAccountId } = useCore();
  const keepSignupInConsole = true;
  // || Boolean(boomiAccountId) || !isProd;
  return {
    signupLink: !keepSignupInConsole ? websiteSignup : LoginRoutes.SIGNUP,
    keepSignupInConsole,
  };
};

export function NewLoginHeaderActions() {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  const { keepSignupInConsole, signupLink } = useGetSignupLink();
  return (
    <ContactSupportWrap isSignup>
      <HStack>
        <Text>Don't have an account?</Text>
        <RiveryButton
          label="Sign Up"
          variant="link"
          fontWeight="400"
          as={keepSignupInConsole && Link}
          to={keepSignupInConsole && LoginRoutes.SIGNUP}
          href={!keepSignupInConsole && signupLink}
          {...(!exoTheme && { color: 'yellow.300' })}
        />
      </HStack>
      <Divider
        color="border-contrast"
        opacity={1}
        orientation="vertical"
        h="14px"
      />
    </ContactSupportWrap>
  );
}

export function NewLoginScreen() {
  const { userId: isUserSignedIn, coreError } = useCore();
  return isUserSignedIn && !coreError ? <SelectView /> : <LoginForm />;
}

function LoginForm() {
  const {
    userEmail,
    pendingSignin,
    coreError,
    userId: isUserSignedIn,
  } = useCore();
  const { login } = useCoreActions();
  const dispatch = useDispatch();
  const { handleSubmit, ...formHookApi } = useForm<CredentialsProps>({
    defaultValues: {
      user_email: userEmail,
    },
  });
  const credentials = useRef<CredentialsProps>();

  useAuthSuccessRedirect();
  const { loginError, loginErrorDocs } = useCheckForLoginErrors();
  const [loading, toggleLoading] = useToggle(false);
  const history = useHistory();
  const onLogin = async (data: CredentialsProps) => {
    toggleLoading();
    credentials.current = data;
    const action: any = await login({
      ...data,
      type: 'password',
      history,
      dispatch,
    });
    if (action?.error) {
      toggleLoading();
    }
    // else {
    //   sendAllTabsEvent(TabsEvents.LOGIN);
    // }
  };
  const isInLoginProcess = isUserSignedIn && !coreError;

  if (pendingSignin || isInLoginProcess) {
    return null;
  }
  return (
    <NewLoginBox
      pt={24}
      h="680px"
      header="Welcome back"
      footer="Learn more about our"
    >
      <form onSubmit={handleSubmit(onLogin)} aria-label="log in">
        <Box mb={4}>
          <RenderGuard condition={coreError || loginError}>
            <LoginError error={loginError} docsLink={loginErrorDocs} />
          </RenderGuard>
        </Box>
        <GoogleSignIn mode={GoogleSignIn.ActionModes.signin} />
        <Flex flexDir="column" gap="6" mt="6">
          <Or />
          <GetStartedWithBoomi />
          <Or />
          <EmailAndPassword formHookApi={formHookApi} forgotPassword />
          <RiveryButton
            isLoading={loading || pendingSignin}
            label="Log In"
            w="full"
            type="submit"
            mt={4}
          />
        </Flex>
      </form>
    </NewLoginBox>
  );
}
const useCheckForLoginErrors = () => {
  const [loginError, setLoginError] = React.useState<string>();
  const [loginErrorDocs, setLoginErrorLink] = React.useState<string>();
  const location = useLocation();
  useEffectOnce(() => {
    const parsedHash = queryString.parse(location.hash?.replace('#/?', '#'));
    const body = parsedHash?.body as string;
    const mode = parsedHash?.mode;
    if (mode === 'login_error' && body) {
      window.location.hash = '';
      const data = JSON.parse(window.atob(body));
      setLoginError(data?.error_message);
      setLoginErrorLink(data?.documentation_url);
    }
  });
  return { loginError, loginErrorDocs };
};
export const useAuthSuccessRedirect = () => {
  const { hasMultipleAccounts, isAuthenticated } = useCore();
  const { search } = useLocation();

  const history = useHistory();
  const location = useLocation();
  const { hasValidParams } = useLoginFromParams();

  const from = location.pathname;
  const routeForSingleAccount = isAuthenticated ? from : '';
  const resolveNextRoute = () =>
    hasValidParams ? location.pathname : LoginRoutes.ACCOUNTS;
  const toUrl = hasMultipleAccounts
    ? resolveNextRoute()
    : routeForSingleAccount;

  useEffect(() => {
    if (hasMultipleAccounts || isAuthenticated) {
      const params = hasMultipleAccounts ? { from } : {};
      history.push(`${toUrl}${search ?? ''}`, params);
      return;
    }
  }, [isAuthenticated, hasMultipleAccounts, history, toUrl, from, search]);
};

const LoginError = ({ error = LOGIN_DEFAULT_ERROR, docsLink }) => (
  <ErrorBox>
    <Text>
      {error}
      <RenderGuard condition={docsLink}>
        <ExternalLink
          url={docsLink}
          label="For more information click here"
          m={1}
        />
      </RenderGuard>
    </Text>
  </ErrorBox>
);
