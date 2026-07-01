import {
  Grid,
  GridProps,
  Tab,
  TabList,
  TabPanel,
  TabPanelProps,
  TabPanels,
  Tabs,
  TabsProps,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useAccount, useCore } from 'store/core';
import { useTabNavigator } from './hooks/useTabNavigator';
import { RiveryTab } from './RiveryTabs.types';

export interface RiveryLinkTabsProps extends Omit<TabsProps, 'children'> {
  items: RiveryTab[];
  /**
   * used for navigating into a tab when clicked
   */
  route: string;
  children?: ReactNode;
  className?: string;
  contentStyle?: TabPanelProps;
  gridProps?: GridProps;
}
/**
 * renders tabs with a listener to url routes
 * requires extra route definition for the nested routes in app-router,
 * the component is the same that includes the RiveryTabs jsx
 * expects a "section" param
 * i.e -
 *    <PrivateRoute
        path="/settings/:section"
        component={Settings}
      />
 */

export function RiveryLinkTabs({
  items,
  route: prefix,
  children = null,
  className,
  contentStyle,
  gridProps,
  ...props
}: RiveryLinkTabsProps) {
  const { isSuperAdminUser, isGlobalOperatorRole, plan } = useCore();
  const { isSettingOn } = useAccount();
  const filteredTabs = items.filter(
    ({ superAdmin, accountSetting, disabledForPlan }) => {
      const canSeeInternalTab = isSuperAdminUser || isGlobalOperatorRole;
      if (superAdmin && !canSeeInternalTab) {
        return false;
      }
      if (accountSetting && !isSettingOn(accountSetting)) {
        return false;
      }
      if (disabledForPlan && disabledForPlan.includes(plan)) {
        return false;
      }
      return true;
    },
  );

  const { activeTabIndex, navigateToTab } = useTabNavigator({
    items,
    filteredItems: filteredTabs,
    prefix,
  });

  return (
    <Grid
      height="full"
      position="relative"
      overflow="hidden"
      className={className}
      {...gridProps}
    >
      <Tabs
        isManual
        isLazy
        index={activeTabIndex}
        onChange={navigateToTab}
        gridArea="tabs"
        display="grid"
        gridTemplateRows="min-content 1fr"
        gridTemplateAreas={`
        'list ${children ? 'childs' : 'list'}'
        'panels panels'
        `}
        overflow="auto"
        {...props}
      >
        <TabList borderBottomWidth="1px" gridArea="list">
          {filteredTabs.map(({ title, isDisabled }) => {
            return (
              <Tab mr={4} key={title} isDisabled={isDisabled} mb="0">
                {title}
              </Tab>
            );
          })}
        </TabList>
        {children ? (
          <Grid
            paddingRight="3"
            gridArea="childs"
            borderBottomWidth="1px"
            justifyContent="end"
          >
            {children}
          </Grid>
        ) : null}
        <TabPanels overflow="auto" h="full" gridArea="panels">
          {filteredTabs.map(({ route, component: TabContent, title }) => {
            return (
              <TabPanel
                key={`${prefix}/${route}`}
                aria-label={title}
                {...contentStyle}
                p="0"
                overflow="auto"
                h="full"
              >
                <TabContent />
              </TabPanel>
            );
          })}
        </TabPanels>
      </Tabs>
    </Grid>
  );
}

// function TabsRouter() {
//   const { path } = useRouteMatch();
//   return (
//     <Switch>
//       <Route path={`${path}/:section`}>
//         <div>INSIDER</div>
//       </Route>
//     </Switch>
//   );
// }
