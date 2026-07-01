import { IAccountDetails, IUserLogin } from 'api/types';

export const REDUCER_KEY = 'core';

export interface CoreState {
  selectedAccountId: string;
  image: string;
  user: Partial<IUserLogin>;
  account: Partial<IAccountDetails>;
  error?: string;
  /**
   * a flag for indicating whether signing-out is still in process - prevents auto-signin
   */
  signOutPending: boolean;
  isSigninPending: boolean;
  boomiAccountId: string;
  isGoogleLogin: boolean;
  googleAccessToken?: string;
  /**
   * a flag for indicating whether we're redirecting to onboarding - prevents home page flash
   */
  isOnboardingRedirect: boolean;
}
