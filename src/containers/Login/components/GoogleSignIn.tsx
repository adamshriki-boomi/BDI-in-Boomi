import { isEnvFeatureActive } from 'components';
import {
  NewSignInGoogleButton,
  SignInGoogleButton,
} from 'components/Form/components/Providers/Google';
import {
  ClickElement,
  GTMEvents,
  withEventTracking,
} from 'components/Tracking/utils';
import { getQueryParams } from 'hooks/router';
import React, { useCallback } from 'react';
import './GoogleSignIn.scss';

export const signupParams = ['ds', 'dt', 'partner', 'partner_account_id'];
enum GoogleSignModes {
  SIGN_IN = 'signin',
  SIGN_UP = 'signup',
}
const googleRedirectUrl = {
  prefix: import.meta.env.VITE_GAPI_REDIRECT_URL_HANDLER_PREFIX,
  suffix: import.meta.env.VITE_GAPI_REDIRECT_URL_HANDLER_SUFFIX,
};

const createRedirectUrl = (mode: GoogleSignModes) => {
  const isFullUrl = googleRedirectUrl.prefix.startsWith('https://');
  return `${isFullUrl ? '' : `${window.location.origin}/`}${
    googleRedirectUrl.prefix
  }/${mode}/${googleRedirectUrl.suffix}`;
};
const getAbsURL = () => {
  const href = window.location.href;
  if (href.slice(-1) === '/') return href.substring(0, href.length - 1);
  else return href;
};
const redirectToGoogle = (mode: GoogleSignModes = GoogleSignModes.SIGN_IN) => {
  const params = {
    mode,
    base_url: getAbsURL(),
    ...getQueryParams(signupParams),
  };
  const state = window.btoa(JSON.stringify(params).trim());
  const redirect_uri = createRedirectUrl(mode);
  window.location.assign(
    `https://accounts.google.com/o/oauth2/auth?state=${state}&fetch_basic_profile=true&response_type=code&scope=openid%20profile%20email&client_id=${
      import.meta.env.VITE_GAPI_CLIENT_ID
    }&redirect_uri=${redirect_uri}&ss_domain=${params.base_url}`,
  );
};

type GoogleSignInProps = {
  mode?: ActionModes;
};
enum ActionModes {
  'signin',
  'signup',
}
const ModeConfig = {
  [ActionModes.signin]: {
    code: GoogleSignModes.SIGN_IN,
    label: 'Log In',
  },
  [ActionModes.signup]: {
    code: GoogleSignModes.SIGN_UP,
    label: 'Sign Up',
  },
};
const signupEvent = {
  event: GTMEvents.TRIAL_FORM_1_CLICK,
  data: { click_element: ClickElement.GOOGLE },
};
export function GoogleSignIn({ mode = ActionModes.signin }: GoogleSignInProps) {
  const { code, label } = ModeConfig[mode];
  const isNewSignup = isEnvFeatureActive('NEW_SIGNUP');
  const onClick = useCallback(
    e =>
      withEventTracking(
        () => redirectToGoogle(code),
        code === GoogleSignModes.SIGN_UP ? signupEvent : undefined,
      )(e),
    [code],
  );
  return isNewSignup ? (
    <NewSignInGoogleButton onClick={onClick} label={`${label} with Google`} />
  ) : (
    <SignInGoogleButton onClick={onClick} />
  );
}

GoogleSignIn.ActionModes = ActionModes;
