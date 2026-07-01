import { createSelector } from '@reduxjs/toolkit';
import {
  AccountSettings,
  AccountTypes,
  IAccountDetails,
  IUserLogin,
  PlansIds,
  UserRoles,
} from 'api/types';
import { AnnualPlansIds, BillingTypes } from 'api/types/billing.types';
import { differenceInDays } from 'date-fns';
import { getDate } from 'utils/api.sanitizer';
import { AppState } from '../reducers';
import { CoreState, REDUCER_KEY } from './core.types';

export const selectCore = (state: AppState): CoreState => state[REDUCER_KEY];

export const selectUser = createSelector(
  selectCore,
  core => core?.user as IUserLogin,
);
export const selectUserId = createSelector(selectUser, user => user?.user_id);
export const selectIsSuperAdmin = createSelector(
  selectUser,
  user => user?.is_super_admin,
);
export const selectIsSuperAdminCreator = createSelector(
  selectUser,
  user => user?.is_super_admin_creator,
);

export const selectAccount = createSelector(
  selectCore,
  core => core?.account as IAccountDetails,
);
export const selectCoreError = createSelector(selectCore, core => core?.error);
export const selectPendingSignin = createSelector(
  selectCore,
  core => core?.isSigninPending,
);
export const selectIsSignOutPending = createSelector(
  selectCore,
  core => core.signOutPending,
);
export const selectIsOnboardingRedirect = createSelector(
  selectCore,
  core => core.isOnboardingRedirect,
);
export const selectActiveAccountId = createSelector(
  selectCore,
  core => core.selectedAccountId,
);
export const selectBoomiAccountId = createSelector(
  selectCore,
  core => core.boomiAccountId,
);
export const selectRefreshToken = createSelector(
  selectUser,
  user => user?.refresh_token,
);
export const selectAccountName = createSelector(
  selectAccount,
  account => account?.account_name,
);
/**
 * for super-admin, user is authenticated only when an account has been selected
 */
export const selectAuthenticated = createSelector(
  selectAccountName,
  (accountName: string) => accountName?.length > 0,
);
export const selectIsSignedIn = createSelector(
  selectUser,
  user => user?.refresh_token?.length > 0,
);
export const selectUserName = createSelector(selectUser, (user: IUserLogin) =>
  user?.first_name ? `${user.first_name} ${user.last_name}` : '',
);
export const selectUserImage = createSelector(selectCore, core => core?.image);

export const selectRecentEnvironment = createSelector(
  selectAccount,
  (account: IAccountDetails) => account?.env_id,
);
export const selectAccounts = createSelector(
  selectUser,
  user => user?.user_accounts,
);
export const selectUserEmail = createSelector(
  selectUser,
  user => user?.user_email,
);
export const selectLoginType = createSelector(
  selectUser,
  user => user?.login_type,
);
export const selectDaysTrial = createSelector(
  selectAccount,
  account => account?.days_trial,
);
export const selectUserWelcomeBack = createSelector(
  selectAccount,
  account => account?.show_welcome,
);
export const selectUserAccounts = createSelector(
  selectUser,
  user => user.user_accounts,
);

export const selectPlan = createSelector(
  selectAccount,
  account => account?.subscription_metadata?.plan,
);

export const selectIsAccountInTrial = createSelector(
  selectAccount,
  (account: IAccountDetails) =>
    account?.is_trial ||
    account?.subscription_metadata?.plan === PlansIds.TRIAL,
);

export const selectBillingType = createSelector(
  selectAccount,
  selectIsAccountInTrial,
  (account, isTrial) =>
    isTrial
      ? BillingTypes.ANNUAL
      : account?.subscription_metadata?.billing_type
      ? account?.subscription_metadata?.billing_type
      : AnnualPlansIds.includes(account?.plan as PlansIds)
      ? BillingTypes.ANNUAL
      : BillingTypes.ON_DEMAND,
);

//check the chargbee date  account?.subscription_metadata?.subscription_start_date?.$date, there's a discrepancy
//for eaxample account 61fbba8c19694a7e17b4360d
export const selectSubscriptionMetadata = createSelector(
  selectAccount,
  selectBillingType,
  (account, billingType) => {
    return {
      billingType,
      planName: account?.subscription_metadata?.plan_name,
      start:
        Boolean(account?.subscription_metadata?.subscription_date) &&
        billingType === BillingTypes.ANNUAL
          ? account?.subscription_metadata?.subscription_date
          : account?.activated_at * 1000,
      end: account?.subscription_metadata?.subscription_end_date,
      purchasedRPU: account?.subscription_metadata?.purchased_rpus,
      updated: account?.subscription_metadata?.last_modified_date,
      accountId: account?.subscription_metadata?.account_id,
    };
  },
);

export const selectPartner = createSelector(
  selectAccount,
  account => account?.partner,
);
export const selectActivatedAt = createSelector(
  selectAccount,
  account => account?.activated_at,
);
export const selectRegistrationDate = createSelector(
  selectAccount,
  account => account?.registration_date,
);

export const selectOwnerEmail = createSelector(
  selectAccount,
  account => account?.owner_email,
);

export const selectUserDetailsForRegistration = createSelector(
  selectOwnerEmail,
  selectUser,
  (owner_email, user) => ({
    owner_email,
    first_name: user?.first_name,
    last_name: user?.last_name,
  }),
);

const defaultSettings = {
  allow_sub_rivers: false,
  enable_kits: false,
  allow_ai_based_processing: false,
};

export const selectMainTarget = createSelector(
  selectAccount,
  account => account?.main_target,
);

export const selectAdminAccountSettings = createSelector(
  selectOwnerEmail,
  selectAccountName,
  selectMainTarget,
  selectAccount,
  (owner_email, account_name, main_target, account) => ({
    owner_email,
    account_name,
    main_target,
    allow_ai_based_processing:
      account?.account_settings?.allow_ai_based_processing,
  }),
);

export const selectAccountSettings = createSelector(
  selectAccount,
  selectAdminAccountSettings,
  (account, adminAccountSettings) => {
    return {
      ...defaultSettings,
      ...account?.account_settings,
      boomi_account_id: account?.boomi_account_id,
      ...adminAccountSettings,
    };
  },
);

export const selectIsSettingOn = createSelector(
  selectAccountSettings,
  settings => (feature: keyof AccountSettings) => settings?.[feature],
);
export const selectHasMultipleAccounts = createSelector(
  selectAccounts,
  accounts => accounts?.length > 1,
);
export const selectHasAccounts = createSelector(
  selectAccounts,
  accounts => accounts?.length > 0,
);
export const selectActiveAccountName = createSelector(
  selectAccount,
  (account: IAccountDetails) => account?.account_name,
);
export const selectIsAccountTypeActive = createSelector(
  selectAccount,
  (account: IAccountDetails) => account?.account_type === 'active',
);
export const selectIsAccountActive = createSelector(
  selectAccount,
  (account: IAccountDetails) => account?.is_active,
);
export const selectIsAccountBlocked = createSelector(
  selectAccount,
  (account: IAccountDetails) => account?.account_type === 'blocked',
);
export const accountType = createSelector(
  selectAccount,
  (account: IAccountDetails) => account?.account_type,
);

export const accountScopes = createSelector(
  selectAccount,
  (account: IAccountDetails) => account?.scopes,
);
export const selectRole = createSelector(
  selectAccount,
  (account: IAccountDetails) => account?.role,
);
export const selectIsGlobalOperator = createSelector(
  selectRole,
  selectAccount,
  (role, account) =>
    Boolean(account?.is_global_operator) || role === UserRoles.GLOBAL_OPERATOR,
);
export const selectIsAdmin = createSelector(
  selectRole,
  (role: UserRoles) => role === UserRoles.ADMIN,
);
export const selectIsDeveloper = createSelector(
  selectRole,
  (role: UserRoles) => role === UserRoles.DEVELOPER,
);
export const selectIsDeploymentAdminRole = createSelector(
  selectRole,
  (role: UserRoles) => role === UserRoles.DEPLOYMENT_ADMIN,
);
export const selectIsViewerRole = createSelector(
  selectRole,
  (role: UserRoles) => role === UserRoles.VIEWER,
);
export const selectIsMemberRole = createSelector(
  selectRole,
  (role: UserRoles) => role === UserRoles.MEMBER,
);
export const selectRequiresAccountCreation = createSelector(
  selectUser,
  selectHasMultipleAccounts,
  (user, hasAccounts) => !hasAccounts && user.first_name,
);
export const hasAccountDetails = createSelector(
  selectAccount,
  account => account && Object.keys(account).length > 0,
);
export const selectTrialEndDate = createSelector(
  selectAccount,
  account => account?.trial_end_date,
);

export const selectBlockedReason = createSelector(
  selectAccount,
  account => account?.blocked_by,
);

export const accountTotalRpu = createSelector(selectAccount, account =>
  account?.is_trial ||
  (account?.account_type === AccountTypes.BLOCKED &&
    account?.activated_at === null)
    ? account?.max_runs
    : account?.subscription_metadata?.purchased_rpus,
);

export const basePlanLimitations = createSelector(selectAccount, account => {
  const today = new Date();
  const expDate = getDate(account?.environments_expiration_date);
  const remainingDays = differenceInDays(expDate, today);
  return {
    inGracePeriod: expDate > today.getTime(),
    remainingDays,
    expDate,
  };
});
