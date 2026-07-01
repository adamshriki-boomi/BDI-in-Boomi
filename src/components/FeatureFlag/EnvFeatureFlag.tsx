import { useAccount } from 'store/core';

type EnvFeatureFlagProps = {
  flag: string;
  children: JSX.Element;
};

/**
 * conditionally render components based on environment variables given by .env files
 * for variables that start with VITE_FEATURE_
 * @property flag - {string} should be without VITE_FEATURE_
 */
export function EnvFeatureFlag({ flag, children }: EnvFeatureFlagProps) {
  return isEnvFeatureActive(flag) ? children : null;
}

export const isEnvFeatureActive = (flag: string) =>
  Boolean(import.meta.env?.[`VITE_FEATURE_${flag}`] === 'true');

export const useIsNewCheckRunActive = () => {
  const { accountSettings } = useAccount();
  //This check will allow new check run api and new run river api if the account settings are not set at all, i.e new accounts
  return (
    accountSettings['allow_new_check_run_api'] !== false &&
    accountSettings['allow_new_run_river_api'] !== false
  );
};
