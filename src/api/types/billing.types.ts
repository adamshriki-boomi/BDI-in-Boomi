import { PlansIds } from './auth.types';

export enum BillingTypes {
  ANNUAL = 'annual',
  ON_DEMAND = 'payg',
}

export const AnnualPlansIds = [
  PlansIds.STARTER_ANNUAL,
  PlansIds.PROFESSIONAL_ANNUAL,
  PlansIds.BASE_2025,
  PlansIds.PROFESSIONAL_2025,
  PlansIds.PRO_PLUS_2025,
  PlansIds.ENTERPRISE_2025,
];

export const STARTER_PRICING_UNIT = '$0.75';
export const BASE_PRICING_UNIT = '$0.9';
export const PROFESSIONAL_PRICING_UNIT = '$1.20';
