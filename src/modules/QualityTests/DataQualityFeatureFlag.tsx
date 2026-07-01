/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAccount } from 'store/core';
import { useHasPlanUpgrade } from './PlanUpgradeRenderer';

/**
 * renders children when at least:
 * 1. feature is enabled in user's settings
 * 2. user is not on starter
 */
export function DataQualityFeatureFlag({ children }) {
  const shouldDisplayUpgrade = useHasPlanUpgrade();
  const { isSettingOn } = useAccount();
  const isDataQualityEnabled = isSettingOn('enable_data_quality');
  // return !shouldDisplayUpgrade || isDataQualityEnabled ? children : null;
  return children;
}
