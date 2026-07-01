import {
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from 'components';
import { ActivitiesView } from './ActivitiesGrid';
import { ViewModes } from './components/helpers';
import { Step1 } from './DeploymentSteps/Step1';
import { Step2 } from './DeploymentSteps/Step2';
import { Step3 } from './DeploymentSteps/Step3';

export function EditPackage({ mode }) {
  return (
    <Flex w="100%" h="100%" overflow="hidden">
      <Tabs w="100%">
        <TabList>
          {tabs.map(({ title }, idx) => {
            const hideTab =
              title === 'Deployments Activity' && mode === ViewModes.VIEW;
            return !hideTab ? (
              <Tab key={idx} fontSize="sm" mr="16px">
                <Text textTransform="capitalize">{title}</Text>
              </Tab>
            ) : null;
          })}
        </TabList>
        <TabPanels h="calc(100% - 45px)">
          {tabs.map((tab, idx) => (
            <TabPanel py={0} h="full" key={`${idx}-${tab.title}`}>
              <tab.component mode={mode} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Flex>
  );
}

const tabs = [
  {
    title: 'General',
    component: Step1,
  },
  {
    title: 'Objects Section',
    component: Step2,
  },
  {
    title: 'Settings',
    component: Step3,
  },
  {
    title: 'Deployments Activity',
    component: ActivitiesView,
  },
];
