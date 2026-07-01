import { ExLoader, LoaderSize } from '@boomi/exosphere';
import {
  Background,
  Box,
  Center,
  Flex,
  HStack,
  Icon,
  Image,
  Link,
  RenderGuard,
  RTextLogoDark,
} from 'components';
import { useMemo } from 'react';
import { Route, RouteProps, Switch } from 'react-router-dom';
import { useAutoLogin, useCore } from 'store/core';
import { BoomiColorHeader } from '../components/BoomiColorHeader';
import { useLoginFromRedirect } from '../hooks/useLoginFromRedirect';
import { QueryParamsRoutes } from '../hooks/useQueryParamsRouter';
import { LoginRoutes } from '../LoginRoutes';
import { NewAccounts, NewAccountsHeaderActions } from './NewAccounts';
import { NewConfirmAccount } from './NewConfirmAccount';
import { NewCreateAccount, NewCreateHeaderActions } from './NewCreateAccount';
import { NewForgotPassword, NewResetHeaderActions } from './NewForgotPassword';
import { NewLoginHeaderActions, NewLoginScreen } from './NewLoginForm';
import { NewPartnerSignUp } from './NewPartnerSignup';
import { NewSetPassword } from './NewSetPassword';
import { NewSignUp, NewSignupHeaderActions } from './NewSignup';

const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';

const mainRoutes = [
  {
    path: LoginRoutes.SIGNUP,
    component: NewSignUp,
    actions: NewSignupHeaderActions,
    bg: exoTheme
      ? 'none'
      : 'url(https://rivery.io/wp-content/themes/rivery-theme/dist/images/Bellatrix.png)',
    logoColor: exoTheme ? 'brand' : 'gray.50',
    rightIcon: '/dist/images/onboarding/right_corner_lines.svg',
    leftIcon: '/dist/images/onboarding/left_side_lines.svg',
    main: true,
  },
  {
    path: LoginRoutes.ACCOUNTS,
    component: NewAccounts,
    actions: NewAccountsHeaderActions,
    rightIcon: '/dist/images/onboarding/account_selection.svg',
  },
  {
    path: LoginRoutes.FORGOT_PASSWORD,
    component: NewForgotPassword,
    actions: NewResetHeaderActions,
    rightIcon: '/dist/images/onboarding/password.svg',
  },
  {
    path: LoginRoutes.SET_PASSWORD,
    component: NewSetPassword,
    actions: NewResetHeaderActions,
    rightIcon: '/dist/images/onboarding/password.svg',
  },
  {
    path: LoginRoutes.RESET_PASSWORD,
    component: NewSetPassword,
    actions: NewResetHeaderActions,
    rightIcon: '/dist/images/onboarding/password.svg',
  },
  {
    path: LoginRoutes.CREATE_ACCOUNT,
    component: NewCreateAccount,
    actions: NewCreateHeaderActions,
    rightIcon: '/dist/images/onboarding/create_account_right.svg',
    leftIcon: '/dist/images/onboarding/create_account_left.svg',
  },
  {
    path: LoginRoutes.CONFIRM_ACCOUNT,
    component: NewConfirmAccount,
    actions: NewCreateHeaderActions,
    rightIcon: '/dist/images/onboarding/email.svg',
  },
  {
    path: LoginRoutes.SIGNUP_PARTNER,
    component: NewPartnerSignUp,
    actions: NewCreateHeaderActions,
    leftIcon: '/dist/images/onboarding/partners.svg',
  },
];

const paramRoutes = QueryParamsRoutes.map(([, config]) => (
  <Route
    key={`login-${config.route}`}
    path={config.route}
    component={config.component}
  />
));

export default function NewLogin() {
  useAutoLogin();
  useLoginFromRedirect();
  const { pendingSignin, isSignedIn } = useCore();
  return (
    <Flex>
      <RenderGuard condition={!isSignedIn && pendingSignin}>
        <Flex
          position="absolute"
          w="100vw"
          h="100vh"
          justifyContent="center"
          alignItems="center"
          bg="white"
          zIndex={1}
        >
          <ExLoader size={LoaderSize.LARGE} />
        </Flex>
      </RenderGuard>
      <Switch>
        {mainRoutes.map(route => (
          <RouteShell {...route} key={route.path} />
        ))}
        {paramRoutes}
        <RouteShell
          path={LoginRoutes.LOGIN_ROOT}
          component={NewLoginScreen}
          actions={NewLoginHeaderActions}
          bg={
            exoTheme
              ? undefined
              : 'url(https://rivery.io/wp-content/themes/rivery-theme/dist/images/Bellatrix.png)'
          }
          rightIcon={'/dist/images/onboarding/right_corner_lines.svg'}
          leftIcon={'/dist/images/onboarding/left_side_lines.svg'}
          logoColor={exoTheme ? 'brand' : 'gray.50'}
          main
        />
      </Switch>
    </Flex>
  );
}

interface RouteComponentProps extends RouteProps {
  actions?: any;
  logoColor?: string;
  bg?: string;
  leftIcon?: string;
  rightIcon?: string;
  main?: boolean;
}

interface RouteComponentCustomProps {
  exoTheme?: boolean;
}

export function RouteShell({
  component,
  actions,
  logoColor = 'brand',
  bg = 'linear-gradient(220deg, #E0DDEC 8.61%, #E5E7EB 32.90%, #E5E7EB 73.29%, #E0DDEC 92.31%)',
  leftIcon = null,
  rightIcon = null,
  main = false,
  ...props
}: RouteComponentProps) {
  const RouteComponent =
    component as React.ComponentType<RouteComponentCustomProps>;
  return (
    <Route {...props}>
      <LoginShell
        actions={actions}
        logoColor={logoColor}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        main={main}
        {...(!exoTheme && { bg })}
      >
        <RouteComponent exoTheme={exoTheme} />
      </LoginShell>
    </Route>
  );
}

const useLoginRoutes = () => {
  return useMemo(
    () =>
      Object.entries(LoginRoutes).map(([key, value]) => {
        if (key !== 'SIGNUP_PARTNER') {
          return value;
        }
        return null;
      }),
    [],
  );
};

export function LoginShell({ children, actions, logoColor, bg, ...rest }) {
  const { refreshToken } = useCore();
  const loginRoutes = useLoginRoutes();
  if (refreshToken && !loginRoutes.includes(window.location.pathname)) {
    return (
      <Flex bg="white" zIndex={0} overflow="auto">
        {children}
      </Flex>
    );
  }
  return (
    <>
      <Flex
        h="100vh"
        w="full"
        bg={bg}
        bgRepeat="no-repeat"
        bgSize="100% 70%"
        flexDir="column"
        overflow="hidden"
        position="relative"
        {...(rest.main && !exoTheme && { bgColor: '#1d0250' })}
      >
        <RenderGuard condition={exoTheme && !rest.main}>
          <BoomiColorHeader rightLinks={<PageHeader actions={actions} />} />
        </RenderGuard>
        <RenderGuard condition={exoTheme && rest.main}>
          <Icon
            as={Background}
            w="978px"
            h="689px"
            position="absolute"
            right="-20rem"
            top="-28rem"
            transform="scaleX(-1)"
          />
          <Icon
            as={Background}
            w="978px"
            h="689px"
            position="absolute"
            left="-20rem"
            bottom="-30rem"
          />
        </RenderGuard>
        <RenderGuard condition={rest.main || !exoTheme}>
          <PageHeader actions={actions} logoColor={logoColor} />
        </RenderGuard>
        <Center h="100vh" w="full">
          <Box
            zIndex={1}
            {...(logoColor === 'brand' && { position: 'relative' })}
          >
            <Image
              src={rest?.rightIcon}
              position="absolute"
              bottom={logoColor !== 'brand' ? '0px' : '115px'}
              right={logoColor !== 'brand' ? '40px' : '-48%'}
              zIndex="-1"
              display={exoTheme ? 'none' : 'block'}
            />
            <Image
              src={rest?.leftIcon}
              position="absolute"
              bottom={logoColor !== 'brand' ? '100px' : '115px'}
              zIndex="-1"
              display={exoTheme ? 'none' : 'block'}
              {...(logoColor === 'brand' && { right: '85%' })}
              {...(logoColor !== 'brand' && { left: '0px' })}
            />
            {children}
          </Box>
        </Center>
      </Flex>
    </>
  );
}

export function PageHeader({ actions, logoColor = undefined }) {
  const ActionsComponent: React.ComponentType = actions;
  return (
    <RenderGuard condition={logoColor} fallback={<ActionsComponent />}>
      <HStack pt={6} px={8} justify="space-between">
        <Box
          as={Link}
          target="_blank"
          href="http://www.rivery.io"
          rel="noopener noreferrer"
        >
          <Icon as={RTextLogoDark} color={logoColor} h="40px" w="200px" />
        </Box>
        <ActionsComponent />
      </HStack>
    </RenderGuard>
  );
}
