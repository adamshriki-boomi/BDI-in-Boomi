import { useCallback } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { RiveryTab } from '../RiveryTabs.types';

interface useTabNavigatorProps {
  items: RiveryTab[];
  filteredItems: RiveryTab[];
  prefix: string;
}
export function useTabNavigator({
  items,
  filteredItems,
  prefix = '',
}: useTabNavigatorProps) {
  const history = useHistory();
  const { path } = useRouteMatch();
  const params: any = useRouteMatch(`${path}/:activeTab`)?.params;
  const activeTab = params?.activeTab;
  const activeTabIndex =
    filteredItems && Boolean(activeTab)
      ? filteredItems?.findIndex(tab => tab.route === activeTab)
      : 0;

  const navigateToTab = useCallback(
    (index: number) => {
      const toTab = filteredItems[index].route;
      history.replace({
        pathname: `${prefix}/${toTab}`,
        search: window.location.search,
      });
    },
    [filteredItems, history, prefix],
  );
  return { activeTabIndex, navigateToTab };
}
