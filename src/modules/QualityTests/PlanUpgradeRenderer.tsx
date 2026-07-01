import { PlansIds } from 'api/types';
import { useCore } from 'store/core';

/**
 * renders children when user's plan requires an upgrade
 */

export function PlanUpgradeRenderer({ children }) {
  const shouldDisplayUpgrade = useHasPlanUpgrade();
  return shouldDisplayUpgrade ? children : null;
}
export const useHasPlanUpgrade = () => {
  const { plan } = useCore();
  return [
    PlansIds.STARTER,
    PlansIds.STARTER_ANNUAL,
    PlansIds.BASE_2025,
  ].includes(plan); // TODO remove legacy pricing - keep only base
};
