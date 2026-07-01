import {
  Center,
  Flex,
  HStack,
  NoConnection,
  NoDataframes,
  NoGroups,
  NoKits,
  NoRivers,
  NoVariables,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from 'components';
import { useLazyGetEnvironmentsTotalsQuery } from 'modules/Environments/environments.query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useAccount, useCore } from 'store/core';
import EmptyEntitiesState from '../components/emptyState';
import {
  useGetFormValues,
  useResetAllQueryParams,
  ViewModes,
} from '../components/helpers';
import { ConnectionsTab } from './ConnectionsTab';
import { DataframesTab } from './DataframesTab';
import { GroupsTab } from './GroupsTab';
import { KitsTab } from './KitsTab';
import { RiversTab } from './RiversTab';
import { VariablesTab } from './VariablesTab';
import { BlueprintsTab } from './BlueprintsTab';

const useDeploymenTabs = () => {
  const { isSuperAdminUser } = useCore();
  const { isSettingOn } = useAccount();
  const tabs = [
    {
      title: 'rivers',
      component: RiversTab,
      entity: 'Data Flow',
      emptyState: NoRivers,
    },
    isSettingOn('allow_recipe') && {
      title: 'blueprints',
      component: BlueprintsTab,
      entity: 'Blueprint',
      emptyState: NoRivers,
    },
    {
      title: 'connections',
      component: ConnectionsTab,
      entity: 'Connection',
      emptyState: NoConnection,
    },
    {
      title: 'dataframes',
      component: DataframesTab,
      entity: 'Dataframe',
      emptyState: NoDataframes,
    },
    {
      title: 'variables',
      component: VariablesTab,
      entity: 'Variable',
      emptyState: NoVariables,
    },
    {
      title: 'groups',
      component: GroupsTab,
      entity: 'Group',
      emptyState: NoGroups,
    },
  ].filter(Boolean) as any[];

  const superAdminTabs = {
    title: 'kits',
    component: KitsTab,
    entity: 'Kit',
    emptyState: NoKits,
  };

  return isSuperAdminUser ? tabs.concat(superAdminTabs) : tabs;
};

export function Step2({ mode = ViewModes.ADD }) {
  const { selectedAccountId } = useCore();
  const isDisabled = mode === ViewModes.VIEW;
  const formApi = useFormContext();
  const resetAllQueryParams = useResetAllQueryParams([
    'name_src',
    'is_scheduled_src',
    'group_id_src',
    'type_src',
    'entity_id',
    'entity_ids',
  ]);
  const [getEnvironmentTotals] = useLazyGetEnvironmentsTotalsQuery();
  const [totals, setTotals] = useState(null);
  const { control } = formApi;
  const tabs = useDeploymenTabs();

  const { sourceEnv, targetEnv } = useGetFormValues(control);

  const fetchTotals = useCallback(async () => {
    const res: any = await getEnvironmentTotals({
      envId: sourceEnv,
      selectedAccountId,
    });
    if (res?.data) {
      setTotals(res?.data);
      return;
    }
    if (res?.error) {
      setTotals({
        connections: 0,
        groups: 0,
        rivers: 0,
        templates: 0,
        variables: 0,
        blueprints: 0,
      });
      return;
    }
  }, [getEnvironmentTotals, selectedAccountId, sourceEnv]);
  useEffect(() => {
    if (sourceEnv || targetEnv) {
      fetchTotals();
    }
  }, [fetchTotals, sourceEnv, targetEnv]);

  const onTabChange = useCallback(() => {
    resetAllQueryParams();
  }, [resetAllQueryParams]);

  return (
    <Flex direction="column" pt={1} gap={4} h="100%">
      <Text color="font-secondary">
        Select the objects you want to include in your package using the
        navigation tabs.
      </Text>
      {totals ? (
        <Tabs
          onChange={onTabChange}
          isLazy
          minH="calc(100% - 20px)"
          overflow="hidden"
        >
          <TabList>
            {tabs.map(({ title }, idx) => (
              <ContentTab
                key={`${title}-${idx}`}
                title={title}
                totals={totals}
              />
            ))}
          </TabList>
          {targetEnv && sourceEnv ? (
            <TabPanels h="calc(100% - 60px)">
              {tabs.map((tab, idx) => {
                const entity = tab.title === 'kits' ? 'templates' : tab.title;
                return (
                  <TabPanel
                    key={`${idx}-${tab.title}`}
                    h="100%"
                    overflow="hidden"
                    position="relative"
                  >
                    {totals[entity] !== 0 ? (
                      <tab.component
                        isDisabled={isDisabled}
                        targetEnv={targetEnv}
                        sourceEnv={sourceEnv}
                      />
                    ) : (
                      <Center h="full">
                        <EmptyEntitiesState
                          entity={tab.entity}
                          icon={tab.emptyState}
                        />
                      </Center>
                    )}
                  </TabPanel>
                );
              })}
            </TabPanels>
          ) : null}
        </Tabs>
      ) : null}
    </Flex>
  );
}

const nameMap = {
  kits: 'templates',
  groups: 'river_groups',
  blueprints: 'recipes',
};

function ContentTab({ title, totals }) {
  const formApi = useFormContext();
  const { control } = formApi;
  const name = ['kits', 'groups', 'blueprints'].includes(title)
    ? nameMap[title]
    : title;
  const entity = useWatch({
    control,
    name: `entities.${name}`,
  });

  const count = useMemo(() => {
    if (entity) {
      return Object.values(entity).filter(Boolean).length;
    }
    return 0;
  }, [entity]);

  const total = useMemo(() => {
    const tab = ['kits', 'blueprints', 'groups'].includes(title)
      ? nameMap[title]
      : title;
    return totals[tab] ?? 0;
  }, [title, totals]);
  return (
    <Tab mr="32px" aria-label={title} gap={2} fontSize="sm">
      <HStack>
        <Text textTransform="capitalize">{title}</Text>
        <Text>
          ({count} of {total})
        </Text>
      </HStack>
    </Tab>
  );
}
