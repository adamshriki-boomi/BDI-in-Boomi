import { UserRoles } from 'api/types';
import { EnvironmentsIcon, Flex, VariablesIcon } from 'components';
import RdsRecipeFile from 'components/Icons/components/RdsRecipeFile';
import { createSidebarUrl } from 'layout/Sidebar/common';
import { useAccount } from 'store/core';
import { SidebarTags } from 'utils/tracking.tags';
import {
  BriefCaseIcon,
  ChartBarIcon,
  ConnectionsIcon,
  MonitoringIcon,
  RiversIcon,
} from '../icons';
import { Section } from '../SubComponents';

export function PagesSection({ isOpen }) {
  const { isSettingOn } = useAccount();
  const MonitoringSection = useMonitoringSection();
  const hide_kits =
    import.meta.env.VITE_KITS_DISABLED_DOMAINS?.split(',').indexOf(
      window.location.host,
    ) >= 0;
  const DataFlowsSection = [
    {
      text: 'Data Flows',
      icon: RiversIcon,
      link: createSidebarUrl('rivers', isAppMode ? null : 'rivers'),
    },
    !hide_kits && {
      text: 'Kits',
      icon: BriefCaseIcon,
      link: createSidebarUrl('kits', null),
    },
  ].filter(Boolean);

  const DataOps = [
    {
      text: 'Connections',
      icon: ConnectionsIcon,
      link: createSidebarUrl('connections', 'connections'),
      'data-pendo-id': SidebarTags.CONNECTIONS_LINK,
    },
    isSettingOn('allow_recipe') && {
      text: 'Blueprints',
      icon: RdsRecipeFile,
      link: createSidebarUrl('blueprints', 'blueprints'),
      'data-pendo-id': SidebarTags.BLUEPRINTS_LINK,
    },
    {
      text: 'Variables',
      icon: VariablesIcon,
      link: createSidebarUrl('variables', 'variables'),
      'data-pendo-id': SidebarTags.VARIABLES_LINK,
    },
    {
      text: 'Environments',
      icon: EnvironmentsIcon,
      roles: [UserRoles.DEPLOYMENT_ADMIN, UserRoles.ADMIN],
      dropdown: true,
    },
  ].filter(Boolean);

  return (
    <Flex flexDir="column" gap={3} overflow="hidden">
      {[
        {
          items: MonitoringSection,
        },
        {
          items: DataFlowsSection,
        },
        {
          items: DataOps,
          flex: 1,
        },
      ].map((props, idx) => (
        <Section
          key={`sidebar-pages-${idx}`}
          {...props}
          isOpen={isOpen}
          divider={idx > 0 && idx < 3}
        />
      ))}
    </Flex>
  );
}

const isAppMode = import.meta.env.VITE_MODE === 'app';

function useMonitoringSection() {
  return [
    {
      text: 'Dashboard',
      icon: ChartBarIcon,
      link: createSidebarUrl('dashboard', 'dashboard'),
    },
    {
      text: 'Activities',
      icon: MonitoringIcon,
      link: createSidebarUrl('activities', 'activities'),
    },
  ];
}
