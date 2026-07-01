import {
  EnvironmentsIcon,
  Flex,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from 'components';
import { UserGroupIcon } from 'layout/Sidebar/components/icons';
import { useMemo } from 'react';
import TeamsGrid from '../Teams/TeamsGrid';
import EnvironmentsTable from './EnvironmentsTable';

export function UsersDrawerTabs({ formApi, disableTeams }) {
  const tabs = useMemo(() => {
    return [
      {
        title: 'Permissions',
        component: () => <EnvironmentsTable userView formApi={formApi} />,
        route: 'environments',
        icon: EnvironmentsIcon,
      },
      {
        title: 'Teams',
        component: () => <TeamsGrid userView setSelectedTeam={console.log} />,
        route: 'teams',
        icon: UserGroupIcon,
        isDisabled: disableTeams,
      },
    ];
  }, [disableTeams, formApi]);
  return (
    <Tabs isLazy p={3}>
      <TabList gap={4}>
        {tabs.map(({ title, icon, isDisabled = false }, index) => (
          <Tab as="a" cursor="pointer" isDisabled={isDisabled} key={index}>
            <Flex gap={2} alignItems="center">
              <Icon as={icon} />
              {title}
            </Flex>
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {tabs.map(({ component: TabContent }, index) => (
          <TabPanel key={index}>
            <TabContent />
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
