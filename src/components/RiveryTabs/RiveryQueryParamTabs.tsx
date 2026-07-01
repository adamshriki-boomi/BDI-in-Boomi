import {
  Box,
  Icon,
  StyleProps,
  Tab,
  TabList,
  TabListProps,
  TabPanel,
  TabPanels,
  TabPanelsProps,
  TabProps,
  Tabs,
} from '@chakra-ui/react';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { useSearchParam } from 'react-use';
import { removeParams, upsertSearchParam } from 'utils/searchParams';
import { RiveryTab } from './RiveryTabs.types';

type RiveryQueryParamTabsProps = {
  tabs: RiveryTab[];
  // the query param displayed in the url
  param?: string;
  gridProps?: StyleProps;
  tabPanelsProps?: TabPanelsProps;
  tabProps?: TabProps;
  tabListProps?: TabListProps;
  [key: string]: any;
};

export function RiveryQueryParamTabs({
  tabs,
  param = 'tab',
  gridProps,
  tabPanelsProps,
  tabProps,
  tabListProps,
  ...props
}: RiveryQueryParamTabsProps) {
  const tabIndex = useTabSearchParam(tabs, param);
  return (
    <Tabs isManual isLazy index={tabIndex} {...gridProps} {...props}>
      <TabList {...tabListProps}>
        {tabs.map(tab => (
          <Tab
            mr={4}
            as={Link}
            to={{
              search: removeParams(upsertSearchParam(param, tab.route), [
                'pageIndex',
                'page',
                'sortBy',
                'sortOrder',
              ]),
            }}
            key={`tab-${tab.title}`}
            gap="2"
            fontSize="sm"
            isDisabled={tab?.isDisabled}
            {...(tab.pendoId && { 'data-pendo-id': tab.pendoId })}
            {...tabProps}
          >
            {tab.icon ? <Icon as={tab.icon} /> : null} {tab.title}
          </Tab>
        ))}
        {tabListProps?.children}
      </TabList>
      <TabPanels {...tabPanelsProps}>
        {tabs.map(tab => (
          <DisabledTabWrapper
            key={`tab-panel-${tab.title}`}
            disabled={
              Boolean(tab?.tabPanelProps?.['aria-disabled']) &&
              Boolean(tabPanelsProps?.['aria-disabled'])
            }
          >
            <TabPanel {...tab.tabPanelProps}>
              <tab.component />
            </TabPanel>
          </DisabledTabWrapper>
        ))}
      </TabPanels>
    </Tabs>
  );
}

function DisabledTabWrapper({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled: boolean;
}): any {
  return disabled ? (
    <Box as="fieldset" disabled display="contents">
      {children}
    </Box>
  ) : (
    children
  );
}

function useTabSearchParam(tabs: RiveryTab[], param = 'tab') {
  const tabParam = useSearchParam(param);
  const tabIndex = tabParam
    ? tabs.reduce(
        (resultIndex, tab, index) =>
          tab.route === tabParam ? index : resultIndex,
        0,
      )
    : 0;
  return tabIndex;
}
