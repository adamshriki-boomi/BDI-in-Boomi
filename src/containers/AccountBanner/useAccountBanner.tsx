import { AccountTypes, PlansIds } from 'api/types';
import { Box } from 'components';
import { useStarterLimitations } from 'hooks/useStarterLimitations';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, useCore } from 'store/core';
import { useBaseLimitations } from '../../hooks/useBaseLimitations';
import { BillingTypes } from 'api/types/billing.types';

function useAccountBannerState() {
  const [componentState, setComponentState] = useState<any>({
    textColor: 'font',
    bgColor: 'yellow.50',
    borderColor: 'yellow.400',
    text: '',
    action: 'subscribe',
    isVisible: false,
    showMiniNotification: false,
  });

  const handlers = useMemo(
    () => ({
      setTextColor: textColor => {
        setComponentState(state => ({ ...state, textColor }));
      },
      setBgColor: bgColor => {
        setComponentState(state => ({ ...state, bgColor }));
      },
      setBorderColor: borderColor => {
        setComponentState(state => ({ ...state, borderColor }));
      },
      setText: text => {
        setComponentState(state => ({ ...state, text }));
      },
      setAction: action => {
        setComponentState(state => ({ ...state, action }));
      },
      setVisible: isVisible => {
        setComponentState(state => ({ ...state, isVisible }));
      },
      setMiniNotification: showMiniNotification => {
        setComponentState(state => ({ ...state, showMiniNotification }));
      },
    }),
    [],
  );

  return [componentState, handlers];
}

function setErrorStyle(handlers) {
  handlers.setTextColor('red.300');
  handlers.setBgColor('red.600');
  handlers.setBorderColor('red.200');
  handlers.setVisible(true);
}

const CHARGEBEE_BLOCKED_KEY = 'SUBSCRIPTION_MANAGER';

//Minimode refers to the icon on the side menu
export function useAccountBannerCases({
  isUsageExceeded = false,
  isUsageWarning = false,
  miniMode = false,
  remainingRpus = 0,
  hasNotifications = false,
  isLoadingNotifications = false,
}) {
  const {
    daysTrial,
    trialEndDate,
    isAccountTypeActive,
    isAccountInTrial,
    accountType,
    isAccountBlocked,
    accountBlockedByReason,
    basePlanLimitations,
    isAdminRole,
    plan,
    billingType,
  } = useCore();
  const { isSettingOn } = useAccount();
  const accountIsInTrial =
    accountType === AccountTypes.TRIAL || isAccountInTrial;

  const today = new Date();
  const hasTrialDays = trialEndDate > today.getTime() / 1000;

  const [
    {
      textColor,
      bgColor,
      borderColor,
      text,
      action,
      isVisible,
      showMiniNotification,
    },
    handlers,
  ] = useAccountBannerState();
  const { showStarterLimitations } = useStarterLimitations(true);
  const { showBaseLimitations } = useBaseLimitations(true);
  const isBasePlan = plan === PlansIds.BASE_2025;
  useEffect(() => {
    if (
      isSettingOn('allow_usage_notifications') &&
      isAdminRole &&
      billingType === BillingTypes.ON_DEMAND &&
      !hasNotifications &&
      !isLoadingNotifications
    ) {
      handlers.setVisible(true);
      handlers.setMiniNotification(true);
      handlers.setText(
        'Want to keep track of your monthly usage? Set up Consumption Notifications',
      );
      handlers.setAction('set_notification');
      handlers.setBgColor('blue.50');
      handlers.setBorderColor('blue.400');
      handlers.setTextColor('blue.800');
      return;
    }
    if (showStarterLimitations || showBaseLimitations) {
      // TODO remove legacy pricing (showStarterLimitations)
      const remainingDays =
        basePlanLimitations?.remainingDays === 0
          ? 'today'
          : `in ${basePlanLimitations?.remainingDays} days`;

      if (basePlanLimitations.remainingDays < 3) {
        setErrorStyle(handlers);
      }
      handlers.setText(
        <strong>
          {isBasePlan ? 'Base' : 'Starter'} pricing plan limitations will take
          effect {remainingDays}
        </strong>,
      );
      handlers.setAction('show');
      handlers.setVisible(true);
      if (!isAdminRole) {
        handlers.setAction(null);
      }
      return;
    }
    if (accountBlockedByReason) {
      handlers.setMiniNotification(true);
      if (accountBlockedByReason === CHARGEBEE_BLOCKED_KEY) {
        handlers.setText(
          <strong>Your account is suspended due to a billing matter.</strong>,
        );
        setErrorStyle(handlers);
        handlers.setAction('manage');
        return;
      }
      handlers.setText(
        <strong>
          Your account is blocked. Contact us for more information.
        </strong>,
      );
      setErrorStyle(handlers);
      handlers.setAction('support');
      return;
    }
    if (accountIsInTrial) {
      handlers.setVisible(true);
      if (!hasTrialDays || isUsageExceeded) {
        handlers.setAction('contact');
        setErrorStyle(handlers);
        handlers.setMiniNotification(true);
        if (isUsageExceeded) {
          handlers.setText(
            <Box>
              <strong>
                You have used all of your free trial’s BDU credits.
              </strong>
            </Box>,
          );
        } else {
          handlers.setText(<strong>Your free trial has ended.</strong>);
        }
      } else {
        handlers.setText(
          <Box>
            Your free trial will end in <strong>{daysTrial} days</strong>. You
            have{' '}
            <strong>
              {remainingRpus.toLocaleString('en-US', {
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              })}{' '}
              credits{' '}
            </strong>{' '}
            remaining.
          </Box>,
        );
      }
      return;
    }
    if (isAccountTypeActive && (isUsageExceeded || isUsageWarning)) {
      handlers.setVisible(true);
      handlers.setMiniNotification(true);
      if (isUsageExceeded) {
        handlers.setAction('contact');
        setErrorStyle(handlers);
        handlers.setText(
          <strong>You have used all your account’s BDU credits.</strong>,
        );
      } else {
        handlers.setAction('subscribe');
        handlers.setText('Your account BDU credit balance is running low.');
      }

      return;
    }
    if (isAccountBlocked) {
      handlers.setMiniNotification(true);
      handlers.setText(
        <strong>
          Your account is blocked. Contact us for more information.
        </strong>,
      );
      setErrorStyle(handlers);
      handlers.setAction('support');
      return;
    }
    handlers.setVisible(false);
  }, [
    accountBlockedByReason,
    accountIsInTrial,
    daysTrial,
    handlers,
    hasTrialDays,
    isAccountBlocked,
    isAccountTypeActive,
    isAdminRole,
    isUsageExceeded,
    isUsageWarning,
    remainingRpus,
    showStarterLimitations,
    showBaseLimitations,
    basePlanLimitations.remainingDays,
    isBasePlan,
    billingType,
    hasNotifications,
    isLoadingNotifications,
    isSettingOn,
  ]);

  return {
    textColor,
    bgColor,
    borderColor,
    text,
    action,
    isVisible,
    showMiniNotification,
    setVisible: handlers.setVisible,
  };
}
