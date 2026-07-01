import { RegisterResponse } from 'api/endpoints/registration.api';
import { GTMEvents, useViewTracking } from 'components/Tracking/utils';
import React, { useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useCore, useCoreActions } from 'store/core';
import emailDomains from '../components/CreateAccountForm/emailsDomains.json';
import { LoginRoutes } from '../LoginRoutes';
import { NewCreateAccountForm } from './NewCreateForm';
import { ContactSupportWrap } from './NewLoginBox';

enum SetupMode {
  START,
  CONFIRM,
  ONBOARDING,
}

export function NewCreateHeaderActions() {
  return <ContactSupportWrap />;
}

export function NewCreateAccount({ exoTheme }) {
  const [setupMode, setSetupMode] = useState<SetupMode>(SetupMode.START);
  const { autoSignIn } = useCoreActions();
  const accountInfo = useAccountResolver();
  const { isSuperAdminUser, pendingSignin } = useCore();
  const { isGoogleSignup, ...profileFromLocation } =
    useAccountDetailsFromLocation();
  const profile = useLocationProfile();
  const userEmail = profile?.user_email;
  const data = {
    user_email: userEmail,
    user_id: profile?.user_id,
    registration_type: isGoogleSignup ? 'google' : 'form',
  };
  useViewTracking(
    setupMode === SetupMode.START
      ? {
          event: GTMEvents.TRIAL_FORM_1_SUCCESS,
          data,
        }
      : undefined,
  );
  useViewTracking({
    event: GTMEvents.TRIAL_FORM_2_VIEW,
    data,
  });
  if (!isSuperAdminUser && !userEmail && pendingSignin === false) {
    return <Redirect to={LoginRoutes.SIGNUP} />;
  }
  const onSubmitSuccess = async (response: RegisterResponse) => {
    const isVerified = !Boolean(response.needVerification);
    const mode = isVerified ? SetupMode.ONBOARDING : SetupMode.CONFIRM;
    if (!Boolean(response.needVerification)) {
      autoSignIn(undefined);
    }
    setSetupMode(mode);
  };

  switch (setupMode) {
    case SetupMode.ONBOARDING:
      return <Redirect to={LoginRoutes.ONBOARDING_GETTING_STARTED} />;

    case SetupMode.CONFIRM:
      return (
        <Redirect
          to={{
            pathname: LoginRoutes.CONFIRM_ACCOUNT,
            state: { user_email: userEmail },
          }}
        />
      );

    case SetupMode.START:
    default:
      return (
        <NewCreateAccountForm
          title="Welcome to Data Integration (Rivery)"
          subtitle="To set up your account, let’s start with some basics:"
          account={accountInfo?.first_name ? accountInfo : profileFromLocation}
          onSubmitSuccess={onSubmitSuccess}
          token={profile?.token}
          exoTheme={exoTheme}
        />
      );
  }
}

const useAccountResolver = () => {
  const { userDetails, userEmail } = useCore();
  const domainName = userEmail
    ? userEmail.split('@')?.[1]?.split('.')?.[0]
    : null;
  const domainNames = !emailDomains.includes(domainName)
    ? {
        company_name: domainName,
        account_name: domainName,
      }
    : {};
  const res = { ...userDetails, ...domainNames };
  return res;
};

type GoogleProfilePayload = {
  first_name: string;
  google_signup: string;
  last_name: string;
  registration: string | boolean; // as boolean
  token: string;
  user_email: string;
  user_id: string;
};
const useLocationProfile = () => {
  const { state } = useLocation<{ data: GoogleProfilePayload }>();
  return state?.data;
};
const useAccountDetailsFromLocation = () => {
  const profile = useLocationProfile();

  return {
    first_name: profile?.first_name,
    last_name: profile?.last_name,
    user_email: profile?.user_email,
    user_id: profile?.user_id,
    isGoogleSignup: profile?.google_signup === 'true',
  };
};
