import { TabPanelProps } from '@chakra-ui/react';
import { AccountSettings, PlansIds } from 'api/types';
import { ReactNode } from 'react';

export interface RiveryTab {
  route: string;
  title: string;
  isDisabled?: boolean;
  component: ReactNode | any;
  superAdmin?: boolean;
  icon?: ReactNode | any;
  tabPanelProps?: TabPanelProps;
  accountSetting?: keyof AccountSettings;
  disabledForPlan?: PlansIds[];
  pendoId?: string;
}
