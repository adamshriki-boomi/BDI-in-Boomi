import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'api';
import { isStatusSuccess } from 'api/endpoints/common.api';
import {
  AccountTypes,
  IAccountDetails,
  IUserLogin,
  TokenPayload,
} from 'api/types';
import { RoutesBuilder } from 'app/routes';
import { Roles } from 'containers/Settings/Users/users.helpers';
import { matchPath } from 'react-router-dom';
import { getOId } from 'utils/api.sanitizer';
import { REDUCER_KEY } from './core.types';
import { LoginRoutes } from 'containers/Login/LoginRoutes';

const createType = (action: string) => `${REDUCER_KEY}/${action}`;

export const getMatchUrl = () => {
  return matchPath<{ account?: string; env?: string; page?: string }>(
    window.location.pathname,
    '/:page/:account/:env',
  );
};

const getAccountTokenData = async loginResponse => {
  let accountData: any = {};
  const account = await API.auth.getTokenFromAutoLogin(loginResponse.data);
  accountData.account = account?.data;
  return accountData;
};

const fetchAccountData = async (loginResponse, params = null) => {
  const accounts = loginResponse?.data?.user_accounts;
  const hasOneAccount = accounts?.length === 1;
  if ((loginResponse.data as any)?.move_to_onboarding && hasOneAccount) {
    // Set flag to prevent home page flash
    params.dispatch?.({
      type: 'core/setOnboardingRedirect',
      payload: true,
    });
    // Redirect immediately before any state updates
    params.history?.push(LoginRoutes.ONBOARDING_GETTING_STARTED);
    const accountData: any = await getAccountTokenData(loginResponse);
    return { login: loginResponse.data, ...accountData } as LoginReturn;
  }
  const match = getMatchUrl();
  let accountData: any = {};
  const isNotViewer = accounts[0].role !== Roles.VIEWER;
  const getTrialHomepage = () =>
    isNotViewer ? RoutesBuilder.home : RoutesBuilder.rivers;
  if (hasOneAccount && !match?.params?.env) {
    const account = await API.auth.getTokenFromAutoLogin(loginResponse.data);
    accountData.account = account?.data;
    // One-shot handoff from the SAML/Boomi SSO flow: when the backend hands us a
    // pre-built redirect path (e.g. Knowledge Hub → new-river), honor it as the
    // intended destination — bypass the pathname guard, since by now LoginGuard
    // may have already mounted the authenticated tree and moved pathname off "/".
    const redirectUrl = (loginResponse.data as any)?.redirect_url;
    if (redirectUrl && params?.history) {
      params.history.push(redirectUrl);
    } else if (
      params?.history &&
      ['/', ''].indexOf(window?.location?.pathname) >= 0
    ) {
      const isTrialAccount = accounts[0].account_type === AccountTypes.TRIAL;
      // In case the user is on the console url we want to move him to the account env path
      const route = isTrialAccount ? getTrialHomepage() : RoutesBuilder.home;
      params?.history?.push(
        route({
          envId: accountData.account.env_id,
          accountId: getOId(accounts[0]?._id),
        }),
      );
    }
  }
  return accountData;
};

type LoginReturn = {
  login: IAccountDetails;
  account: IUserLogin;
};
export const login = createAsyncThunk(
  createType('login'),
  async (credentials: Record<string, any>) => {
    try {
      const loginResponse = await API.auth.signin(credentials);
      const accountData: any = await fetchAccountData(loginResponse, {
        history: credentials?.history,
        dispatch: credentials?.dispatch,
      });
      return { login: loginResponse.data, ...accountData } as LoginReturn;
    } catch (error) {
      throw error;
    }
  },
);

export const loginMultiAccount = createAsyncThunk(
  createType('loginMultiAccount'),
  async (
    payload: Pick<
      TokenPayload,
      | 'account_id'
      | 'env_id'
      | 'user_id'
      | 'refresh_token'
      | 'refresh_subscription'
    >,
  ): Promise<Partial<IAccountDetails>> => {
    try {
      return await API.auth.getToken(payload).then(response => response?.data);
    } catch (error) {
      throw error;
    }
  },
);

export const signOut = createAsyncThunk(createType('signOut'), async () => {
  try {
    await API.auth.revokeGoogleToken();
    const logoutResponse: any = await API.auth.signOut();
    return logoutResponse;
  } catch (error) {
    throw error;
  }
});

export const autoSignIn = createAsyncThunk(
  createType('autoSignIn'),
  async (params: any = null) => {
    try {
      const loginResponse: any = await API.auth.autoSignIn();
      const accountData: any = await fetchAccountData(loginResponse, params);
      return { login: loginResponse.data, ...accountData };
    } catch (error) {
      throw error;
    }
  },
);

export const updatePassword = createAsyncThunk(
  createType('updatePassword'),
  async (props: any) => {
    try {
      return await API.auth.changePassword(props);
    } catch (error) {
      throw error;
    }
  },
);

export const updateEnvironmentId = createAsyncThunk(
  createType('updateEnvironmentId'),
  async (args: { account_id: string; env_id: string }) => {
    try {
      return await API.auth.requestToken({
        ...args,
        account_id: { $oid: args.account_id },
      });
    } catch (error) {
      throw error;
    }
  },
);

export const signUp = createAsyncThunk(
  createType('signUp'),
  async (credentials: any) => {
    try {
      const response = await API.auth.signUp(credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },
);

export const extendTrial = createAsyncThunk(
  createType('extendTrial'),
  async (params: any) => {
    try {
      const response = await API.accounts.extendTrial(params);
      return response;
    } catch (error) {
      throw error;
    }
  },
);

export const blockAccount = createAsyncThunk(
  createType('blockAccount'),
  async () => {
    try {
      const response = await API.accounts.blockAccount();
      if (isStatusSuccess(response)) {
        window.location.reload();
      }
      return response;
    } catch (error) {
      throw error;
    }
  },
);
export const activateAccount = createAsyncThunk(
  createType('activateAccount'),
  async (selectedPlan: string) => {
    try {
      const response = await API.accounts.activateAccount(selectedPlan);
      if (isStatusSuccess(response)) {
        window.location.reload();
      }
      return response;
    } catch (error) {
      throw error;
    }
  },
);
