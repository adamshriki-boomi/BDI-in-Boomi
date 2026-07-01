import { defineStoreAuth, defineStoreLogin } from 'api/api.interceptors';
import { Storage } from 'api/storage';
import {
  IAccountDetails,
  Partner,
  SignupResponse,
  TokenPayload,
} from 'api/types';
import { AxiosResponse } from 'axios';
import { LOGIN_TYPE } from 'containers/Login/Login';
import { getOId } from 'utils/api.sanitizer';
import {
  api,
  extractData,
  extractErrorData,
  get,
  getDataWithoutCache,
  post,
  postBody,
} from '../api.proxy';
import { getHubSpotUTK, StatusCodes } from './common.api';

const TOKEN_URL = `/token`;
const LOGIN_URL = `/login`;
const LOGOUT_URL = `/logout`;
const REVOKE_ACCOUNT_TOKEN_URL = `/revoke_token`;
const CHANGE_PASSWORD = 'user_management/password';
const SIGNUP_PASSWORD = 'signup/password';
const SIGNUP_GOOGLE = 'signup/google';
const FORGOT_PASSWORD = `${LOGIN_URL}/forgotPassword`;
const RESET_PASSWORD = `${LOGIN_URL}/password/reset`;
const GOOGLE_LOGOUT_URL = 'https://accounts.google.com/o/oauth2/revoke';

const getLoginStorage = () => Storage.getData(Storage.Keys.LOGIN, true);
const getGoogleTokenStorage = () =>
  Storage.getData(Storage.Keys.GOOGLE_TOKEN, false);
const storeLogin = (data = '', parse = false) =>
  Storage.store(Storage.Keys.LOGIN, data, parse);
export const extractErrorMessage = (response: AxiosResponse) =>
  response?.data?.msg_to_present ||
  response?.data?.message ||
  response?.data?.error_msg;
export const throwResponseError = (reason: any) => {
  throw new Error(extractErrorMessage(reason.response));
};

// add interceptors
defineStoreLogin(api, LOGIN_URL);
defineStoreAuth(api, TOKEN_URL);
defineStoreAuth(api, SIGNUP_PASSWORD);
// defineStoreAuth(apiV1, TOKEN_URL); TODO ASK OREN

export async function signin(
  credentials,
): Promise<AxiosResponse<IAccountDetails>> {
  return post(LOGIN_URL, {
    user_g_id: -1,
    ...credentials,
  }).catch(throwResponseError);
}

export async function autoSignIn() {
  return await post(LOGIN_URL, {
    type: 'refresh_token',
  }).catch(throwResponseError);
  // const token = await auth.getToken(extractTokenData(loginData));
  // return { login: loginData, token: token.data };
}
type SignUpConfig = {
  confirm_password: string;
  first_name: string;
  first_url: boolean | string;
  last_name: string;
  password: string;
  partner_account_id: string;
  partner: Partner;
  login_type: LOGIN_TYPE.PASSWORD | LOGIN_TYPE.GOOGLE;
  user_email: string;
  wp_referrer: boolean;
};
const defaultSignUpConfig = {
  device: navigator.appVersion,
  // TODO where that's coming from?
  first_url: false,
  referrer_url: document?.referrer,
  wp_referrer: false,
};

function captchaHeaders(recaptcha: string) {
  return {
    headers: {
      'x-user-response': recaptcha,
    },
  };
}

export async function signUp(
  config: Partial<SignUpConfig>,
  recaptcha = undefined,
): Promise<SignupResponse> {
  try {
    return post(
      config?.login_type === 'password' ? SIGNUP_PASSWORD : SIGNUP_GOOGLE,
      {
        ...defaultSignUpConfig,
        referrer_url: document?.referrer,
        ...getHubSpotUTK(),
        ...config,
      },
      captchaHeaders(recaptcha),
    ).then(extractData);
  } catch (error) {
    throw error;
  }
}

export async function getToken(data: Partial<TokenPayload>) {
  return post(TOKEN_URL, {
    ...data,
    type: 'refresh_token',
    expiration: 86400,
  }).then(normalizeEnvId);
}

/**
 * converts env_id prop to include a string value
 * env_id is returned as { $oid: string } for single non-super-admin account
 */
const normalizeEnvId = (response: AxiosResponse<TokenPayload>) => {
  const account = response.data;
  const env_id =
    typeof account?.env_id === 'string'
      ? account?.env_id
      : getOId(account.env_id);
  return {
    ...response,
    data: {
      ...account,
      env_id,
    },
  };
};

export async function getTokenFromAutoLogin(data) {
  const hasAccounts = data?.user_accounts?.length > 0;
  if (!hasAccounts) return { data };
  const tokenData: TokenPayload = extractTokenData(data);

  const { env_id: defaultEnv, account_id, ...rest } = tokenData;
  return getToken({ ...rest, account_id, env_id: getOId(defaultEnv) });
}

export async function signOut() {
  const loginData = getLoginStorage();
  return post(LOGOUT_URL, {
    refresh_token: loginData?.refresh_token,
  }).then(response => {
    if (response.status === StatusCodes.SUCCESS) {
      Storage.clear();
    }
  });
}

export async function revokeGoogleToken() {
  const accessToken = getGoogleTokenStorage();
  return (
    accessToken &&
    getDataWithoutCache(GOOGLE_LOGOUT_URL, { token: accessToken }, {})
  );
}
export async function revokeAccountToken() {
  return api.defaults.headers.authorization && get(REVOKE_ACCOUNT_TOKEN_URL);
}

// props should include token keys only
type RequestTokenResponse = {
  login: any;
  account: any;
};
export async function requestToken(props: {
  [key: string]: any;
}): Promise<RequestTokenResponse> {
  const loginData = getLoginStorage();
  const data: TokenPayload = { ...extractTokenData(loginData), ...props };
  const updatedLoginData = updateAccount();
  const token = await getToken(data);
  return { login: updatedLoginData, account: token.data };
}

type ChangePasswordProps = {
  confirm_password: string;
  new_password: string;
  password: string;
};
export async function changePassword(props: ChangePasswordProps) {
  return post(CHANGE_PASSWORD, props)
    .then(extractData)
    .catch(error => error?.response?.data?.message);
}

type ForgotPasswordProps = {
  user_email: string;
};

export async function forgotPassword(
  props: ForgotPasswordProps,
  recaptcha = undefined,
) {
  return post(FORGOT_PASSWORD, props, captchaHeaders(recaptcha)).catch(
    extractErrorData,
  );
}

const extractTokenData = ({ refresh_token, user_id, user_accounts }) => ({
  refresh_token,
  user_id,
  account_id: user_accounts[0]._id,
  env_id: user_accounts[0].env_id,
});

const updateAccount = () => {
  let loginData = getLoginStorage();
  storeLogin(loginData, true);
  return loginData;
};

export const callResetPassword = ({
  token,
  ...props
}: {
  confirm_password: string;
  password: string;
  token: string;
}): Promise<{ message: string }> => {
  return postBody(`${RESET_PASSWORD}/${token}`, props);
};
