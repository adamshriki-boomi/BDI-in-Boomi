import TagManager from 'react-gtm-module';
import {
  autoSignIn,
  getMatchUrl,
  login,
  loginMultiAccount,
} from 'store/core/core.effects';
import { selectUser } from 'store/core/core.selectors';
import { getId, getOId } from 'utils/api.sanitizer';
import { handleLoginToAccount } from './tracking.handlers';
const tagManagerArgs = {
  gtmId: 'GTM-NMLDNWH',
};
if (
  import.meta.env.VITE_ENABLED_DOMAINS?.split(',').indexOf(
    window.location.host,
  ) >= 0
) {
  TagManager.initialize(tagManagerArgs);
}
type TrackActionType = {
  action: any;
  store?: any;
};
export const trackingHandler = store => next => async action => {
  actionMiddlewares?.[action?.type] &&
    actionMiddlewares?.[action?.type]({ action, store });
  const result = next(action);
  return result;
};

const caseLogin = ({ action, store }: TrackActionType) => {
  // Source userId and user from the login response, not from meta.arg (the
  // credentials, which carry no user_id) or the store (not yet populated — this
  // middleware runs before the reducer). Mirrors caseAutoSignin so logins are
  // identified instead of creating anonymous, unidentified Candu profiles.
  // Fallback on "legacy" to prevent possible breakage
  const legacyUserId = getOId(action?.meta?.arg?.user_id);
  const userId = getOId(action?.payload?.login?.user_id);
  const accountId = getOId(action?.payload?.login?.user_accounts?.[0]?._id);
  const hasAccount = Boolean(action.payload?.account);
  if (hasAccount) {
    handleLoginToAccount({
      userId: userId ?? legacyUserId,
      accountId,
      user: action?.payload?.login ?? selectUser(store.getState() as never),
      accountInfo: action?.payload,
    });
  }
};

//These are the ids of the users we use for cypress tests (super admin, and regular user)
const testsUsersExcludedFromGTM = [
  '6731ef51fd9453394fb01b29',
  '676271378fc4e54f8bae4a95',
  '6784c97a586bc8c1e9b52407',
];

const caseMultiAccount = ({ action, store }: TrackActionType) => {
  const userId = getOId(action?.meta?.arg?.user_id);
  const accountId = getOId(action?.meta?.arg?.account_id);
  if (!testsUsersExcludedFromGTM.includes(userId)) {
    handleLoginToAccount({
      userId,
      accountId,
      user: selectUser(store.getState() as never),
      accountInfo: action?.payload,
    });
  }
};

const caseAutoSignin = ({ action, store }: TrackActionType) => {
  const userId = getOId(action?.payload?.login?.user_id);
  const userAccounts = action?.payload?.login?.user_accounts;
  const user = action?.payload?.login;
  const match = getMatchUrl();
  if (
    !testsUsersExcludedFromGTM.includes(userId) &&
    userAccounts?.length === 1 &&
    !match?.params?.env
  ) {
    const accountId = getId(action?.payload?.login?.user_accounts?.[0]);
    handleLoginToAccount({
      userId,
      accountId,
      user,
      accountInfo: action?.payload?.account,
    });
  }
};

const actionMiddlewares = {
  [login.fulfilled.type]: caseLogin,
  [loginMultiAccount.fulfilled.type]: caseMultiAccount,
  [autoSignIn.fulfilled.type]: caseAutoSignin,
};
