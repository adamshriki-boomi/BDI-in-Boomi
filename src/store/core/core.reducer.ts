import { createSlice } from '@reduxjs/toolkit';
import { Storage } from 'api/storage';
import { AccountTypes } from 'api/types';
import { getOId } from 'utils/api.sanitizer';
import {
  activateAccount,
  autoSignIn,
  blockAccount,
  extendTrial,
  login,
  loginMultiAccount,
  signOut,
  updateEnvironmentId,
} from './core.effects';
import { CoreState, REDUCER_KEY } from './core.types';

export const initialState: CoreState = {
  selectedAccountId: '',
  image: '',
  user: {
    first_name: '',
    last_name: '',
    user_email: '',
  },
  account: {},
  error: '',
  boomiAccountId: '',
  signOutPending: false,
  isSigninPending: null,
  isGoogleLogin: false,
  isOnboardingRedirect: false,
};

export const slice = createSlice({
  name: REDUCER_KEY,
  initialState,
  reducers: {
    setBoomiAccountId(state, action) {
      if (action.payload) {
        state.boomiAccountId = action.payload;
      }
    },
    setUserEmail(state, action) {
      if (action.payload) {
        (state.user as any).user_email = action.payload;
      }
    },
    toggleOffPending(state) {
      setSigningStatus(state, false);
    },
    setOnboardingRedirect(state, action) {
      state.isOnboardingRedirect = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, (state, action) => {
        const hasGoogleLoginCredentials = Boolean(
          action?.meta?.arg?.google_account,
        );
        setGoogleLogin(
          state,
          hasGoogleLoginCredentials,
          action?.meta?.arg?.access_token,
        );
        setLoginError(state, action);
      })
      .addCase(login.fulfilled, (state, action) => {
        updateAuthorization(state, action);
        updateSigningStatus(state, action);
      })
      .addCase(login.rejected, setLoginError)
      .addCase(autoSignIn.pending, updateSigningStatus)
      .addCase(autoSignIn.rejected, (state, action) => {
        const isGoogleLogin = state.isGoogleLogin;
        if (!isGoogleLogin) {
          updateSigningStatus(state, action);
        }
      })
      .addCase(autoSignIn.fulfilled, (state, action) => {
        updateAuthorization(state, action);
        updateSigningStatus(state, action);
      })
      .addCase(loginMultiAccount.pending, updateSigningStatus)
      .addCase(loginMultiAccount.rejected, (state, action) => {
        setLoginError(state, action);
        reset();
      })
      .addCase(loginMultiAccount.fulfilled, (state, action) => {
        updateAccount(state, action);
        updateSigningStatus(state, action);
      })
      .addCase(updateEnvironmentId.fulfilled, updateAuthorization)
      .addCase(signOut.fulfilled, reset)
      .addCase(extendTrial.fulfilled, extendTrialAccount)
      .addCase(activateAccount.fulfilled, (state, action) =>
        setAccountType(state, action, AccountTypes.ACTIVE),
      )
      .addCase(blockAccount.fulfilled, (state, action) =>
        setAccountType(state, action, AccountTypes.BLOCKED),
      );
  },
});

function setSigningStatus(state, status: boolean) {
  state.isSigninPending = status;
}
function updateSigningStatus(state: CoreState, action) {
  setSigningStatus(state, action.type.includes('pending'));
}
function updateAuthorization(state: CoreState, action) {
  if (!action.error) {
    const { login, account } = action.payload;
    const hasSelectedAccount = state.selectedAccountId?.length > 0;
    state.user = login;
    state.account = account;
    window.kapaSettings = { user: { uniqueClientId: getOId(login?.user_id) } };

    // selectedAccountId should be updated only when id is not set
    if (!hasSelectedAccount) {
      const hasAccount = login?.user_accounts?.length > 0;
      const selectedAccount = hasAccount
        ? getOId(login.user_accounts[0]._id)
        : '';
      state.selectedAccountId = selectedAccount;
    }
  }
}

function updateAccount(state: CoreState, action) {
  if (!action.error) {
    if (action.payload?.boomi_account_id) {
      state.boomiAccountId = action.payload?.boomi_account_id;
    }
    state.account = action.payload;
    state.selectedAccountId = getOId(action.meta.arg.account_id);
  }
}

function setLoginError(state, action) {
  updateSigningStatus(state, action);
  state.error = action?.error?.message || '';
}

function reset() {
  return { ...initialState };
}

const isStatusSuccess = action => action?.payload?.status_code === 200;

function extendTrialAccount(state: CoreState, action) {
  if (isStatusSuccess(action)) {
    const days = action.meta.arg.extend_time;
    state.account.days_trial = state.account.days_trial + days;
  }
}

function setAccountType(state: CoreState, action, accountType: AccountTypes) {
  if (isStatusSuccess(action)) {
    state.account.account_type = accountType;
    state.account.is_active = accountType === AccountTypes.ACTIVE;
  }
}

function setGoogleLogin(
  state: CoreState,
  value: boolean,
  googleAccessToken?: string,
) {
  state.isGoogleLogin = value;
  Storage.store(Storage.Keys.GOOGLE_TOKEN, googleAccessToken);
}
