import { Flex, RenderGuard } from 'components';
import SuspendedRiversNotifications from './SuspendedRivers';
import UsageNotifications from './Usage';
import { useAccount, useCore } from 'store/core';
import { PlansIds } from 'api/types';

export default function AccountNotifications() {
  const { isSettingOn } = useAccount();
  const { plan } = useCore();
  return (
    <Flex flexDir="column" gap={4}>
      <RenderGuard
        condition={
          isSettingOn('allow_usage_notifications') && plan !== PlansIds.TRIAL
        }
      >
        <UsageNotifications />
      </RenderGuard>
      <SuspendedRiversNotifications />
    </Flex>
  );
}
