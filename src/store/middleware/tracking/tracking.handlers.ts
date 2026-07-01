import { GTMEvents, withEventTracking } from 'components/Tracking/utils';
import { LoadCanduScript } from '../../../modules/LoadExternals/KapaAndCandu';

const handleLoginToAccountBase = (pendo, { user, accountId, payload }) => {
  pendo.initialize({
    visitor: {
      id: user?.user_email,
      user: user?.user_id?.$oid,
      firstName: user?.first_name,
      lastName: user?.last_name,
      role: payload.role,
    },
    account: {
      id: payload?.boomi_account_id ?? accountId,
      account_id: accountId,
      env_id: payload?.env_id,
      env_name: payload?.env_name,
      account_name: payload?.account_name,
      status: payload?.account_type,
      is_default_env: payload?.is_default_env,
    },
  });
};
const withPendo = callbackFn => {
  return (...args) => {
    const pendoApi = window['pendo'];
    pendoApi && callbackFn(pendoApi, ...args);
  };
};
const mapFields = data => {
  const {
    userId: user_id,
    user: { user_email, first_name, last_name },
    accountId: account_id,
    accountInfo: {
      account_name,
      role,
      plan,
      days_trial,
      account_type,
      trial_end_date,
      registration_date,
      user_insert_time,
      activated_at,
      partner,
    },
  } = data;
  const is_trial = account_type === 'trial' || days_trial < 0;
  return {
    account_name,
    first_name,
    last_name,
    role,
    plan,
    account_id,
    user_email,
    user_id,
    is_trial,
    activated_at,
    partner,
    trial_end_date_at: trial_end_date,
    user_created_at: user_insert_time,
    registration_date: registration_date,
  };
};

export const handleLoginToAccount = data => {
  try {
    withEventTracking(
      () => {
        // Load Candu only once we have a real userId to identify with. Candu
        // keys profiles by userId, so initializing without one (e.g. an account
        // switch that carries accountId but no user_id) produces an anonymous,
        // unidentified profile. init runs inside the SDK's onload so it fires
        // after the script is ready.
        if (data?.userId) {
          LoadCanduScript(() => {
            if (!window?.Candu?.init) {
              return;
            }
            const insertTime = data?.accountInfo?.user_insert_time;
            const accountTrialEndDate = data?.accountInfo?.trial_end_date;
            const accountSubscriptionStartDate = data?.accountInfo.activated_at;
            const registrationDate = data?.accountInfo?.registration_date;
            const lastLogin = data?.user?.last_login?.$date;
            const traits = {
              email: data?.user?.user_email,
              lastLogin: lastLogin ? new Date(lastLogin).toISOString() : null,
              accountId: data?.accountId,
              userName: `${data?.user?.first_name} ${data?.user?.last_name}`,
              domain: window.location.origin,
              partner: data?.accountInfo?.partner,
              accountType: data?.accountInfo?.account_type,
              insertTime: insertTime
                ? new Date(insertTime).toISOString()
                : null,
              accountName: data?.accountInfo?.account_name,
              accountTrialEndDate: accountTrialEndDate
                ? new Date(accountTrialEndDate).toISOString()
                : null,
              active_account_type: data?.accountInfo?.account_type,
              accountSubscriptionStartDate: accountSubscriptionStartDate
                ? new Date(accountSubscriptionStartDate * 1000).toISOString()
                : null,
              accountPlan: data?.accountInfo?.plan,
              accountRegistrationDate: registrationDate
                ? new Date(registrationDate * 1000).toISOString()
                : null,
            };
            window?.Candu?.init({
              userId: data?.userId,
              clientToken: 'Ef1TIvdnVD',
              traits,
            });
          });
        }
        withPendo(handleLoginToAccountBase)({
          user: data?.user,
          accountId: data?.accountId,
          payload: data?.accountInfo,
        });
      },
      {
        event: GTMEvents.USER_LOGIN,
        data: mapFields(data),
      },
    )(data);
  } catch (e) {
    console.error(e);
  }
};
