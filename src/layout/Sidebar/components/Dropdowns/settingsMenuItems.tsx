import {
  Box,
  Crown,
  ExclamationInfoFilled,
  HStack,
  Icon,
  Text,
} from 'components';
import { useAccountBannerCases } from 'containers/AccountBanner/useAccountBanner';
import { useApiTokens } from 'containers/Settings/Tokens/AddTokenModal';
import {
  createSidebarUrl,
  menuItemIconStyle,
  menuItemStyle,
} from 'layout/Sidebar/common';
import { useIsUsageExceeded } from 'modules/Consumption/helpers';
import { useCallback, useMemo } from 'react';
import { useAccount, useCore } from 'store/core';
import {
  ApiTokensIcon,
  AuditLogIcon,
  CashIcon,
  CogWheel,
  UserGroupIcon,
} from '../icons';

export const useSettingsMenuItems = toggleUpgradeForm => {
  const allowAuditLog = useAuditLog();
  const allowApiTokens = useApiTokens();
  const appendFilterFn = useAppendIsAdminRoleFilter();
  const createHref = useCreateUrlForAccount();
  const { over, warning } = useIsUsageExceeded();
  const { showMiniNotification } = useAccountBannerCases({
    miniMode: true,
    isUsageExceeded: over || warning,
  });
  return useMemo(() => {
    return [
      {
        value: 'Account Settings',
        href: createHref('settings'),
        icon: <SettingsItemIcon as={CogWheel} />,
      },
      {
        value: 'Users',
        href: createHref('users'),
        icon: <SettingsItemIcon as={UserGroupIcon} />,
      },
      {
        value: (
          <TitleMenuItem
            title="API Tokens"
            isAllowedInAccount={allowApiTokens}
          />
        ),
        href: createHref('tokens'),
        icon: <SettingsItemIcon as={ApiTokensIcon} />,
        tagger: !allowApiTokens ? 'upgrade-api-tokens' : null,
      },
      {
        value: (
          <HStack gap={2}>
            <Text>Plans & Billing</Text>
            {showMiniNotification ? (
              <Icon
                marginInlineStart="0px!important"
                color="data-solid-coral!important"
                as={ExclamationInfoFilled}
                boxSize="18px"
              />
            ) : null}
          </HStack>
        ),
        href: createHref('consumption'),
        icon: <SettingsItemIcon as={CashIcon} />,
      },
      {
        value: (
          <TitleMenuItem title="Audit Log" isAllowedInAccount={allowAuditLog} />
        ),
        href: createHref('audit'),
        icon: <SettingsItemIcon as={AuditLogIcon} />,
        tagger: !allowApiTokens ? 'upgrade-api-tokens' : null,
      },
    ]
      .map(appendFilterFn)
      .map(appendMenuItemStyle);
  }, [
    createHref,
    showMiniNotification,
    allowAuditLog,
    appendFilterFn,
    allowApiTokens,
  ]);
};

function TitleMenuItem({ isAllowedInAccount, title }) {
  return (
    <HStack>
      <Text flexGrow={1}>{title}</Text>
      {isAllowedInAccount ? null : (
        <Box mt="8px">
          <Icon
            mt="6px"
            as={Crown}
            color="data-solid-coral!important"
            boxSize={5}
          />
        </Box>
      )}
    </HStack>
  );
}

// HELPERS
const SettingsItemIcon = props => <Icon {...props} {...menuItemIconStyle} />;
const appendMenuItemStyle = item => ({
  ...item,
  ...menuItemStyle,
});

const useAppendIsAdminRoleFilter = () => {
  const { isAdminRole, isGlobalOperatorRole } = useCore();
  return useCallback(
    item => ({
      ...item,
      filterFn: () => isAdminRole || isGlobalOperatorRole,
    }),
    [isAdminRole, isGlobalOperatorRole],
  );
};
const useCreateUrlForAccount = () => {
  const { envId, activeAccountId: accountId } = useCore();
  return useCallback(
    (prefix: string) => createSidebarUrl(prefix)({ envId, accountId }),
    [accountId, envId],
  );
};
const useAuditLog = () => {
  const { isSettingOn } = useAccount();
  return isSettingOn('allow_audit_log');
};
