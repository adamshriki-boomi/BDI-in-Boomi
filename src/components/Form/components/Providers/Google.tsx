import { Icon } from '@chakra-ui/react';
import { RiveryButton } from 'components/Buttons';
import { ConnectedComponent } from 'components/Form/components/Providers/Provider';
import { ReactComponent as GoogleG } from 'containers/Login/components/images/google-g.svg';
import * as React from 'react';

export const Google = ({ credentials, label, setCredentials, ...rest }) => {
  return Boolean(credentials) ? (
    <ConnectedComponent
      IconComponent={<Icon as={GoogleG} boxSize={6} mr={4} />}
      label={label}
      setCredentials={setCredentials}
    />
  ) : (
    <RiveryButton
      leftIcon={<Icon as={GoogleG} boxSize={6} mr={4} />}
      aria-label="connect with google"
      className="google-sign-in"
      justifyContent="center"
      variant="transparent"
      {...rest}
      label="Sign in with Google"
    />
  );
};

export const SignInGoogleButton = props => (
  <RiveryButton
    w="full"
    height={58}
    leftIcon={<Icon as={GoogleG} w={6} h={6} mr={4} />}
    aria-label="connect with google"
    className="google-sign-in"
    justifyContent="center"
    variant="transparent"
    {...props}
    label="Sign in with Google"
  />
);

export const NewSignInGoogleButton = props => (
  <RiveryButton
    w="full"
    height={10}
    leftIcon={<Icon as={GoogleG} w={5} h={5} mr={4} />}
    aria-label="connect with google"
    className="google-sign-in"
    variant="transparent"
    {...props}
    label={props.label}
  />
);
