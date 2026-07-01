import { ControlList } from 'api/types';

export enum ActiveAccountType {
  PARTNER = 'partner',
  INTERNAL = 'internal',
  CUSTOMER = 'customer',
}
enum PartnerPlan {
  REGISTERED = 'registered',
  Gold = 'gold',
  SILVER = 'silver',
}
const partnerPlanOptions = [
  { name: 'Registered', id: PartnerPlan.REGISTERED },
  { name: 'Gold', id: PartnerPlan.Gold },
  { name: 'Silver', id: PartnerPlan.SILVER },
];
const activeAccountTypeOptions = [
  { name: 'Internal', id: ActiveAccountType.INTERNAL },
  { name: 'Partner', id: ActiveAccountType.PARTNER },
  { name: 'Customer', id: ActiveAccountType.CUSTOMER },
];
export enum ManagedByType {
  RIVERY = 'Rivery',
  BOOMI = 'Boomi',
}
const ManagedByOptions = [
  { name: ManagedByType.RIVERY, id: ManagedByType.RIVERY },
  { name: ManagedByType.BOOMI, id: ManagedByType.BOOMI },
];
export const activeAccountTypeInput = {
  type: ControlList.SELECT_SINGLE,
  name: 'active_account_type',
  display_name: 'Active Account Type',
  placeholder: 'Customer',
  required: false,
  options: activeAccountTypeOptions,
  chakra: true,
};
export const managedByTypeInput = {
  type: ControlList.SELECT_SINGLE,
  name: 'managed_by',
  display_name: 'Managed By',
  placeholder: ManagedByType.RIVERY,
  required: false,
  options: ManagedByOptions,
  chakra: true,
};
export const partnerPlanInput = {
  type: ControlList.SELECT_SINGLE,
  condition: {
    field_name: 'active_account_type',
    equals: ActiveAccountType.PARTNER,
  },
  name: 'partner_plan',
  display_name: 'Partner Subscription Plan',
  required: true,
  options: partnerPlanOptions,
  chakra: true,
};
