import { Box, Center, Heading } from '@chakra-ui/react';
import { Plans, PlansIds } from 'api/types';
import {
  BillingTypes,
  PROFESSIONAL_PRICING_UNIT,
  STARTER_PRICING_UNIT,
  BASE_PRICING_UNIT,
} from 'api/types/billing.types';
import { TooltipBDU } from 'modules/Consumption/helpers';
import React from 'react';

export const BilledAnnually = (
  <Heading as="h3" fontSize="large" fontWeight="bold" color="brand">
    Custom plan tailored <br /> to your needs
  </Heading>
);

const PriceComponent = ({ price }) => (
  <Box>
    <Center textStyle="M7">
      {price} / <Box fontSize="smaller"> BDU credit</Box>
      <TooltipBDU iconStyle={{ color: 'icon-disabled' }} />
    </Center>
  </Box>
);

type PlanConfig = {
  isMostPopular?: boolean;
  plan_types?:
    | PlansIds
    | {
        [key in BillingTypes]?: PlansIds;
      };
  description: JSX.Element;
  color?: string;
  priceComponent?:
    | JSX.Element
    | {
        [key in BillingTypes]?: JSX.Element;
      };
  featuresTitle: string;
  featuresList: string[];
  btnLabel: string;
  btnVariant: string;
};

export type PlanConfiguration = {
  [key in Plans]?: PlanConfig;
};

export const planConf: PlanConfiguration = {
  [Plans.STARTER]: {
    plan_types: {
      [BillingTypes.ANNUAL]: PlansIds.STARTER_ANNUAL,
      [BillingTypes.ON_DEMAND]: PlansIds.STARTER,
    },
    description: (
      <>
        For small BI and data teams <br />
        with basic needs and ETL <br />
        functionality.
      </>
    ),
    color: 'purple.100',
    priceComponent: {
      [BillingTypes.ANNUAL]: BilledAnnually,
      [BillingTypes.ON_DEMAND]: <PriceComponent price={STARTER_PRICING_UNIT} />,
    },
    featuresTitle: 'Included Features:',
    featuresList: [
      'One Environment',
      'Two Users',
      'Unlimited Data Sources & Destinations  ',
      'Built-in Workflow Orchestration',
      'Built-in Version Control',
    ],
    btnLabel: 'Subscribe',
    btnVariant: 'primary',
  },
  [Plans.PROFESSIONAL]: {
    isMostPopular: true,
    plan_types: {
      [BillingTypes.ANNUAL]: PlansIds.PROFESSIONAL_ANNUAL,
      [BillingTypes.ON_DEMAND]: PlansIds.PROFESSIONAL_PAYG,
    },
    color: 'green.200',
    description: (
      <>
        For advanced data teams
        <br /> with engineering capabilities. Perfect for companies looking to
        scale.
      </>
    ),
    priceComponent: {
      [BillingTypes.ANNUAL]: BilledAnnually,
      [BillingTypes.ON_DEMAND]: (
        <PriceComponent price={PROFESSIONAL_PRICING_UNIT} />
      ),
    },
    featuresTitle: 'Everything in Starter, plus:',
    featuresList: [
      'Three Environments',
      'Role-Based Access Control',
      'Run Python Code',
      'Built-in CI/CD',
      'Access to the Boomi Data Integration API & CLI',
    ],
    btnLabel: 'Subscribe',
    btnVariant: 'green',
  },
  [Plans.ENTERPRISE]: {
    plan_types: {
      [BillingTypes.ANNUAL]: PlansIds.ENTERPRISE,
      [BillingTypes.ON_DEMAND]: PlansIds.ENTERPRISE,
    },
    priceComponent: {
      [BillingTypes.ANNUAL]: BilledAnnually,
      [BillingTypes.ON_DEMAND]: BilledAnnually,
    },
    description: (
      <>
        For large enterprises working <br />
        across teams and regions, that need unlimited scale and extensive
        security.
      </>
    ),
    color: 'purple.100',
    featuresTitle: 'Enterprise options include:',
    featuresList: [
      'Unlimited Environments',
      'Single Sign-On (SSO) & PrivateLink',
      'API High-frequency Replication',
      'Dedicated Customer Success Manager',
      'Enterprise SLA',
    ],
    btnLabel: 'Talk To Sales',
    btnVariant: 'primary',
  },
};

export const planConf2025: PlanConfiguration = {
  [Plans.BASE_2025]: {
    description: (
      <>
        Introductory pay as you go <br />
        edition
      </>
    ),
    plan_types: PlansIds.BASE_2025,
    priceComponent: <PriceComponent price={BASE_PRICING_UNIT} />,
    featuresTitle: 'Key features include:',
    featuresList: [
      'One Environment',
      'Two Users',
      'Unlimited Connections  ',
      'Workflow Orchestration',
      'Built-in Version Control',
    ],
    btnLabel: 'Subscribe now',
    btnVariant: 'outlined-primary',
  },
  [Plans.PROFESSIONAL_2025]: {
    isMostPopular: true,
    description: (
      <>
        Core functionality for small <br />
        data teams
      </>
    ),
    plan_types: PlansIds.PROFESSIONAL_2025,
    featuresTitle: 'Everything in Base +',
    featuresList: [
      'Two Environments',
      'Unlimited Users & RBAC',
      'Run Python Code',
      'Built-in CI/CD',
      'Access to the Boomi Data Integration API & CLI',
    ],
    btnLabel: 'Talk To Sales',
    btnVariant: 'primary',
    color: 'background-selected',
  },
  [Plans.PRO_PLUS_2025]: {
    description: (
      <>
        For data teams with larger <br />
        data replication needs
      </>
    ),
    plan_types: PlansIds.PRO_PLUS_2025,
    featuresTitle: 'Everything in Professional +',
    featuresList: [
      'Three Environments',
      'PrivateLink',
      'Reverse SSH',
      'API High-frequency syncs',
    ],
    btnLabel: 'Talk To Sales',
    btnVariant: 'outlined-primary',
  },
  [Plans.ENTERPRISE_2025]: {
    description: (
      <>
        For enterprises with extensive <br />
        data and security requirements
      </>
    ),
    plan_types: PlansIds.ENTERPRISE_2025,
    featuresTitle: 'Everything in Pro Plus +',
    featuresList: [
      'Unlimited Environments',
      'VPN tunnels',
      'Oracle CDC',
      'Enterprise SLA',
      'Higher sync frequency',
    ],
    btnLabel: 'Talk To Sales',
    btnVariant: 'outlined-primary',
  },
};
