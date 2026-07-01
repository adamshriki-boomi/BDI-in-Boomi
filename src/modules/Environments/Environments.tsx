import {
  Breadcrumbs,
  EnvironmentsIcon,
  GridBox,
  RiveryTabs,
  RocketOutlineIcon,
  VariablesIcon,
} from 'components';
import { getQueryParams } from 'hooks/router';
import { EnvironmentsTags } from 'utils/tracking.tags';
import { EnvironmentsManager } from 'modules/Environments/EnvironmentsManager/EnvironmentsManager';
import { EnvironmentsSettings } from 'modules/Environments/EnvironmentsSettings/EnvironmentsSettings';
import { VariablesManager } from 'modules/Environments/EnvironmentsVariables/VariablesManager';
import * as React from 'react';
import { useMemo } from 'react';
import { BiCog } from 'react-icons/bi';
import { useCore } from 'store/core';
import { Deployments } from './Deployments/Deployments';

export function Environments() {
  const { tab } = getQueryParams(['tab']);
  const { isAdminRole, isDeploymentAdminRole, isGlobalOperatorRole } =
    useCore();
  const isAdminOrGlobalOperator = isAdminRole || isGlobalOperatorRole;

  const tabs = useMemo(() => {
    return [
      isAdminOrGlobalOperator && {
        title: 'Manager',
        route: 'manager',
        component: EnvironmentsManager,
        icon: EnvironmentsIcon,
        pendoId: EnvironmentsTags.MANAGER_TAB,
      },
      (isAdminOrGlobalOperator || isDeploymentAdminRole) && {
        title: 'Deployments',
        route: 'deployments',
        component: Deployments,
        icon: RocketOutlineIcon,
        pendoId: EnvironmentsTags.DEPLOYMENTS_TAB,
      },
      isAdminOrGlobalOperator && {
        title: 'Variables',
        route: 'variables',
        component: VariablesManager,
        icon: VariablesIcon,
        pendoId: EnvironmentsTags.VARIABLES_TAB,
      },
      isAdminOrGlobalOperator && {
        title: 'Settings',
        route: 'settings',
        component: EnvironmentsSettings,
        icon: BiCog,
        pendoId: EnvironmentsTags.SETTINGS_TAB,
      },
    ]
      .filter(Boolean)
      .map(tab => ({
        ...tab,
        tabPanelProps,
      }));
  }, [isAdminOrGlobalOperator, isDeploymentAdminRole]);

  return (
    <GridBox
      gridGap={3}
      bg="white"
      overflow="hidden"
      m="3"
      px={4}
      pt={3}
      gridTemplateRows="min-content 1fr"
    >
      <Breadcrumbs
        links={[{ label: 'Environments' }, { label: tab ?? 'manager' }]}
      />
      <RiveryTabs
        items={tabs}
        route="tab"
        queryParam
        gridProps={{
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
        }}
        tabPanelsProps={{ overflow: 'hidden' }}
      />
    </GridBox>
  );
}

const tabPanelProps = {
  height: 'full',
  display: 'flex',
  w: 'full',
  overflow: 'auto',
};
