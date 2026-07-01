import { useSelector } from 'react-redux';
import * as selectors from '../core.selectors';

export function useCore() {
  const state = {
    isAuthenticated: useSelector(selectors.selectAuthenticated),
    isSignedIn: useSelector(selectors.selectIsSignedIn),
    refreshToken: useSelector(selectors.selectRefreshToken),
    isSignOutPending: useSelector(selectors.selectIsSignOutPending),
    isOnboardingRedirect: useSelector(selectors.selectIsOnboardingRedirect),
    user: useSelector(selectors.selectUser),
    username: useSelector(selectors.selectUserName),
    userImage: useSelector(selectors.selectUserImage),
    userEmail: useSelector(selectors.selectUserEmail),
    loginType: useSelector(selectors.selectLoginType),
    boomiAccountId: useSelector(selectors.selectBoomiAccountId),
    ownerEmail: useSelector(selectors.selectOwnerEmail),
    userDetails: useSelector(selectors.selectUserDetailsForRegistration),
    accountSettings: useSelector(selectors.selectAccountSettings),
    adminAccountSettings: useSelector(selectors.selectAdminAccountSettings),
    userId: useSelector(selectors.selectUserId),
    isSuperAdminUser: useSelector(selectors.selectIsSuperAdmin),
    isSuperAdminCreator: useSelector(selectors.selectIsSuperAdminCreator),
    isGlobalOperatorRole: useSelector(selectors.selectIsGlobalOperator),
    envId: useSelector(selectors.selectRecentEnvironment),
    selectedAccountId: useSelector(selectors.selectActiveAccountId),
    plan: useSelector(selectors.selectPlan),
    billingType: useSelector(selectors.selectBillingType),
    partner: useSelector(selectors.selectPartner),
    activatedAt: useSelector(selectors.selectActivatedAt),
    registrationDate: useSelector(selectors.selectRegistrationDate),
    accountType: useSelector(selectors.accountType),
    activeAccountId: useSelector(selectors.selectActiveAccountId),
    activeAccountName: useSelector(selectors.selectActiveAccountName),
    isAccountTypeActive: useSelector(selectors.selectIsAccountTypeActive),
    isAccountActive: useSelector(selectors.selectIsAccountActive),
    isAccountInTrial: useSelector(selectors.selectIsAccountInTrial),
    isAccountBlocked: useSelector(selectors.selectIsAccountBlocked),
    accounts: useSelector(selectors.selectAccounts),
    account: useSelector(selectors.selectAccount),
    accountScopes: useSelector(selectors.accountScopes),
    hasMultipleAccounts: useSelector(selectors.selectHasMultipleAccounts),
    hasAccounts: useSelector(selectors.selectHasAccounts),
    isAdminRole: useSelector(selectors.selectIsAdmin),
    role: useSelector(selectors.selectRole),
    isDeveloperRole: useSelector(selectors.selectIsDeveloper),
    isDeploymentAdminRole: useSelector(selectors.selectIsDeploymentAdminRole),
    isViewerRole: useSelector(selectors.selectIsViewerRole),
    coreError: useSelector(selectors.selectCoreError),
    daysTrial: useSelector(selectors.selectDaysTrial),
    requiresAccountCreation: useSelector(
      selectors.selectRequiresAccountCreation,
    ),
    pendingSignin: useSelector(selectors.selectPendingSignin),
    userMainTarget: useSelector(selectors.selectMainTarget),
    hasAccountDetails: useSelector(selectors.hasAccountDetails),
    isWelcomeBack: useSelector(selectors.selectUserWelcomeBack),
    trialEndDate: useSelector(selectors.selectTrialEndDate),
    accountBlockedByReason: useSelector(selectors.selectBlockedReason),
    totalAcquiredRPU: useSelector(selectors.accountTotalRpu),
    subscriptionMetadata: useSelector(selectors.selectSubscriptionMetadata),
    starterPlanLimitations: useSelector(selectors.basePlanLimitations), // TODO remove legacy pricing
    basePlanLimitations: useSelector(selectors.basePlanLimitations),
  };

  return state;
}

/**
 * expose state related to the currently signed in account
 */
export function useAccount() {
  return {
    isSettingOn: useSelector(selectors.selectIsSettingOn),
    isViewerRole: useSelector(selectors.selectIsViewerRole),
    isMemberRole: useSelector(selectors.selectIsMemberRole),
    accountSettings: useSelector(selectors.selectAccountSettings),
  };
}
