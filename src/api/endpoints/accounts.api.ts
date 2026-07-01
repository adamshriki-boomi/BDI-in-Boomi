import { extractData, extractErrorData, patch, post } from '../api.proxy';
const ACCOUNTS_URL = `/accounts`;

type SettingsParams = { [key: string]: any };

export const updateSuperAdminSettings = (params: SettingsParams) => {
  return post(`${ACCOUNTS_URL}/set_account_settings`, params).catch(
    extractErrorData,
  );
};

export const updateSettingsAdmin = (params: SettingsParams, account_id) => {
  return patch(`${ACCOUNTS_URL}/${account_id}`, params).catch(extractErrorData);
};

export const blockAccount = () => {
  return post(`${ACCOUNTS_URL}/block`).then(extractData);
};

export const activateAccount = selectedPlan => {
  return post(`${ACCOUNTS_URL}/activate`, { plan: selectedPlan }).then(
    extractData,
  );
};

type ExtendTrialParams = { [key: string]: any };
export const extendTrial = (params: ExtendTrialParams) => {
  return post(`extend_trial`, params).then(extractData);
};
