import { AppRoutes, paramsReplacer } from 'app/routes';
import {
  EnvironmentsIcon,
  ExclamationInfoFilled,
  HStack,
  Icon,
  RocketOutlineIcon,
  Text,
  VariablesIcon,
} from 'components';
import { menuItemIconStyle, menuItemStyle } from 'layout/Sidebar/common';
import { useCallback } from 'react';
import { useCore } from 'store/core';
import { CogWheel } from '../icons';

export const useEnvironmentsMenuItems = () => {
  const {
    isAdminRole,
    isDeploymentAdminRole,
    isGlobalOperatorRole,
    selectedAccountId: account,
    envId: env,
    basePlanLimitations,
  } = useCore();
  const url = useCallback(
    tab =>
      paramsReplacer(`${AppRoutes.ENVIRONMENTS}?tab=${tab}`)({ account, env }),
    [account, env],
  );
  const isAdminOrGlobalOperator = isAdminRole || isGlobalOperatorRole;

  return [
    isAdminOrGlobalOperator && {
      value: (
        <HStack gap={1}>
          <Text>Environments Manager</Text>
          {Object.values(basePlanLimitations).every(Boolean) ? (
            <Icon
              marginInlineStart="0px!important"
              color="yellow.200"
              as={ExclamationInfoFilled}
              boxSize="18px"
            />
          ) : null}
        </HStack>
      ),
      href: url('manager'),
      icon: <Icon as={EnvironmentsIcon} {...menuItemIconStyle} />,
      ...menuItemStyle,
      pr: '0px!important',
    },
    (isAdminOrGlobalOperator || isDeploymentAdminRole) && {
      value: 'Deployments',
      href: url('deployments'),
      icon: <Icon as={RocketOutlineIcon} {...menuItemIconStyle} />,
      ...menuItemStyle,
    },
    isAdminOrGlobalOperator && {
      value: 'Variables',
      href: url('variables'),
      icon: <Icon as={VariablesIcon} {...menuItemIconStyle} />,
      ...menuItemStyle,
    },
    isAdminOrGlobalOperator && {
      value: 'Settings',
      href: url('settings'),
      icon: <Icon as={CogWheel} {...menuItemIconStyle} />,
      ...menuItemStyle,
    },
  ].filter(Boolean);
};
