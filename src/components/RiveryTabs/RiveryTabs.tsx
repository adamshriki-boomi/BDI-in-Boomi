import {
  GridProps,
  TabListProps,
  TabPanelProps,
  TabPanelsProps,
  TabProps,
  TabsProps,
} from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import { RiveryLinkTabs } from './RiveryLinkTabs';
import { RiveryQueryParamTabs } from './RiveryQueryParamTabs';
import { RiveryTab } from './RiveryTabs.types';

export interface RiveryTabsProps extends Omit<TabsProps, 'children'> {
  items: RiveryTab[];
  /**
   * used for navigating into a tab when clicked
   * in queryParam mode, this acts as the query param in the url
   */
  route?: string;
  children?: ReactNode;
  contentStyle?: TabPanelProps;
  gridProps?: GridProps;
  tabPanelsProps?: TabPanelsProps;
  tabProps?: TabProps;
  tabListProps?: TabListProps;
  // false (default), if true, will use RiveryQueryParamTabs
  queryParam?: boolean;
}

export function RiveryTabs({
  items,
  route: prefix,
  children = null,
  queryParam = false,
  contentStyle = null,
  gridProps = null,
  tabPanelsProps = null,
  tabProps = null,
  tabListProps = null,
  ...props
}: RiveryTabsProps) {
  return queryParam ? (
    <RiveryQueryParamTabs
      tabs={items}
      param={prefix}
      gridProps={gridProps}
      tabPanelsProps={tabPanelsProps}
      tabProps={tabProps}
      tabListProps={tabListProps}
    />
  ) : (
    <RiveryLinkTabs
      items={items}
      route={prefix}
      children={children}
      contentStyle={contentStyle}
      gridProps={gridProps}
      {...props}
    />
  );
}
