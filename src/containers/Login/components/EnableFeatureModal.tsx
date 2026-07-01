import {
  AuditLogsBoomiUpgrade,
  CdcOracleBoomiUpgrade,
  Crown,
  EnvBoomiUpgrade,
  ExternalLink,
  Flex,
  Grid,
  Icon,
  PythonBoomiImage,
  RiveryApiBoomiImage,
  RiveryButton,
  RiveryModal,
  RiveryModalProps,
  SecurityBoomi,
  Text,
} from 'components';
import { UpgradeModal } from 'components/RiveryModal/UpgradeModal';
import { Tagger } from 'components/Tracking/Tagger';
import { TrialMessage } from 'containers/AppNavbar/TrialMessage';
import { useGetIsAccountThatIsManagedByBoomi } from 'containers/Settings/Users/users.helpers';
import { useContactSales } from 'hooks/useContactSales';
import { useToggle } from 'react-use';

interface EnableFeatureModalProps extends RiveryModalProps {
  feature: string;
}

const getConfigurations = (isManagedByBoomi: boolean) => {
  const baseEnvConfig = {
    title: 'Why settle for a few Environments<br> when you can have even more?',
    features: [
      'Manage each phase of the development lifecycle (Dev, Test/QA, Stage, Prod).',
      'Separate your data by department, team, or project.',
      'Create Multi-tenant data applications for your customers.',
    ],
    moreFeaturesTitle:
      'Get more Environments, plus all <strong>Professional Plan</strong> benefits:',
    moreFeatures: [
      'Unlimited Users & Role-based Access',
      'Access to Python transformations & processing',
      '15-min syncs, advanced Scheduling, and more',
      'Access to our API & CLI and more',
    ],
    leftImage: <Icon as={EnvBoomiUpgrade} boxSize="285px" />,
    Action: () => {
      return (
        <Grid gap={4}>
          <VisitDocumentation to="https://rivery.io/blog/rivery-environments-manage-every-phase-of-dataops-from-start-to-finish/" />
          <UpgradeNowButton />
        </Grid>
      );
    },
  };

  return {
    python: {
      title: 'Unleash the power of Python.',
      features: [
        'Use Python for maximum flexibility.',
        'Solve complex data challenges with Python Logic Steps.',
        'Get managed Python and DataFrames and build any data workflow.',
      ],
      moreFeaturesTitle:
        'Get Python, plus all <strong>Professional Plan</strong> benefits:',
      moreFeatures: [
        'Three Environments & Deployments',
        'Unlimited Users & Role-based Access',
        'Unlimited Users & RBAC',
        '15-min syncs & Advanced Scheduling',
        'Access to our API & CLI and more',
      ],
      leftImage: <Icon as={PythonBoomiImage} boxSize="285px" />,
      Action: () => {
        const scheduleMeeting = useContactSales();
        return (
          <Grid gap={4}>
            <Flex gap={1}>
              <ExternalLink
                label="Learn more"
                url="https://rivery.io/blog/python-for-etl-build-advanced-data-workflows/"
                size="medium"
              />
              <Text>or</Text>
              <RiveryButton
                label="speak with our data experts"
                variant="link"
                size="medium"
                onClick={scheduleMeeting}
              />
              for additional details.
            </Flex>
            <UpgradeNowButton />
          </Grid>
        );
      },
    },
    api: {
      title: 'Get access to the world of Data Integration API.',
      features: [
        'Automate and streamline your data management processes.',
        'Programmatically create, run, or delete Data Flows, Environments, and more.',
        'Check your Data Flow execution status from other platforms.',
        'Embed data pipeline creation into your product.',
      ],
      moreFeaturesTitle:
        'Get Data Integration API, plus all <strong>Professional Plan</strong> benefits:',
      moreFeatures: [
        'Three Environments & Deployments',
        'Unlimited Users & Role-based Access',
        'Access to Python transformations & processing',
        '15-min syncs, advanced Scheduling, and more',
      ],
      leftImage: <Icon as={RiveryApiBoomiImage} boxSize="285px" />,
      Action: () => {
        return (
          <Grid gap={4}>
            <VisitDocumentation to="https://help.boomi.com/docs/Atomsphere/Data_Integration/RESTAPI/dataintegration-api-overview" />
            <UpgradeNowButton />
          </Grid>
        );
      },
    },
    audit: {
      title: 'Keep track of your records with Audit Log.',
      features: [
        'Unlock Audit Log access to track all events and changes.',
        'Follow which tasks were carried out, by whom, and how the system reacted.',
      ],
      moreFeaturesTitle:
        'Get Audit Log, plus all <strong>Pro Plus Plan</strong> benefits:',
      moreFeatures: [
        'Three Environments',
        ...(!isManagedByBoomi ? ['Single Sign-On & SCIM'] : []),
        'PrivateLink',
        'Reverse SS',
        'API High-frequency syncs',
      ],
      leftImage: <Icon as={AuditLogsBoomiUpgrade} boxSize="285px" />,
      Action: () => {
        const [showPricingModal, togglePricingModal] = useToggle(false);
        return (
          <Grid gap={3}>
            <VisitDocumentation to="https://help.boomi.com/docs/Atomsphere/API%20Management/Topics/cp-Configuration_audit_logs" />
            <RiveryButton
              variant="primary"
              width="max-content"
              label="Upgrade Now"
              leftIcon={<Icon as={Crown} w={5} h={5} color="primary" />}
              onClick={() => togglePricingModal(true)}
            />
            <TrialMessage
              togglePricingModal={togglePricingModal}
              showPricingModal={showPricingModal}
            />
          </Grid>
        );
      },
    },
    oracleCdc: {
      title: 'Seamlessly replicate your Oracle data with CDC',
      features: [
        'Sync only data changes and reduce the impact on your database.',
        'Unlock fresh data insights with near real-time data replication.',
      ],
      moreFeaturesTitle:
        'Get Oracle CDC, plus all <strong>Enterprise Plan</strong> benefits:',
      moreFeatures: [
        'Unlimited Environments and Deployments',
        'Unlimited Users & Role-based Access',
        'Access to Python transformations & processing',
        'High‒frequency Replication & Syncs',
        'Access to our API & CLI',
        'Dedicated CSM and Enterprise SLA, and more',
      ],
      leftImage: <Icon as={CdcOracleBoomiUpgrade} boxSize="285px" />,
      Action: () => {
        const scheduleMeeting = useContactSales();
        return (
          <Grid gap={3}>
            <Flex gap={1} alignItems="baseline">
              <RiveryButton
                variant="link"
                label="Learn more"
                href="https://help.boomi.com/docs/category/security"
                target="_blank"
              />{' '}
              or
              <RiveryButton
                label="speak with our data experts"
                variant="link"
                onClick={scheduleMeeting}
              />
              for additional details
            </Flex>
            <UpgradeNowButton />
          </Grid>
        );
      },
    },
    boomiForSap: {
      title: 'Seamlessly replicate your SAP data',
      features: [
        'Sync SAP data from ECC, S/4 HANA, and BW using Boomi for SAP.',
        'Unlock fresh data insights with near real-time data replication.',
      ],
      moreFeaturesTitle:
        'Get SAP plus all <strong>Pro Plus Plan</strong> Benefits:',
      moreFeatures: [
        'Unlimited Environments and Deployments',
        'Unlimited Users & Role-based Access',
        'Access to Python transformations & processing',
        'High‒frequency Replication & Syncs',
        'Access to our API & CLI',
        'Dedicated CSM and Enterprise SLA, and more',
      ],
      leftImage: <Icon as={CdcOracleBoomiUpgrade} boxSize="285px" />,
      Action: () => {
        const talkToAnExpert = useContactSales();
        return (
          <Grid gap={3}>
            <Flex gap={1} alignItems="baseline">
              <RiveryButton
                variant="link"
                label="Learn more"
                href="https://help.boomi.com/docs/category/security"
                target="_blank"
              />{' '}
              or
              <RiveryButton
                label="speak with our data experts"
                variant="link"
                onClick={talkToAnExpert}
              />
              for additional details
            </Flex>
            <UpgradeNowButton />
          </Grid>
        );
      },
    },
    baseEnv: baseEnvConfig,
    starterEnv: baseEnvConfig, // TODO remove legacy pricing
    professionalEnv: {
      title:
        'Why settle for a few Environments<br> when you can have unlimited ?',
      features: [
        'Manage each phase of the development lifecycle (Dev, Test/QA, Stage, Prod).',
        'Separate your data by department, team, or project.',
        'Create Multi-tenant data applications for your customers.',
      ],
      moreFeaturesTitle:
        'Get unlimited Environments, plus all <strong>Enterprise Plan</strong> benefits:',
      moreFeatures: [
        ...(!isManagedByBoomi ? ['SSO & Secured Connectivity'] : []),
        'High‒frequency Replication & Syncs',
        'Dedicated Customer Success Manager',
        'Enterprise SLA',
      ],
      leftImage: <Icon as={EnvBoomiUpgrade} boxSize="285px" />,
      Action: () => {
        return (
          <Grid gap={3}>
            <VisitDocumentation to="https://rivery.io/blog/rivery-environments-manage-every-phase-of-dataops-from-start-to-finish/" />
            <UpgradeNowButton />
          </Grid>
        );
      },
    },
    security: {
      title: 'Data is secured. Over and Out.',
      features: [
        ...(!isManagedByBoomi
          ? [
              'Setup SAML single sign-on (SSO) by authenticating through your organization’s identity provider',
            ]
          : []),
        'Connect via Private Link',
        'Connect through reverse SSH tunnel',
        'Connect securely to via VPN',
      ],
      moreFeaturesTitle:
        'Get more security, plus all <strong>Enterprise Plan</strong> benefits:',
      moreFeatures: [
        'Unlimited Environments, with Deployment Functionality',
        'Audit Log',
        'High frequency Replication',
        'Dedicated CSM and Enterprise SLA',
      ],
      leftImage: <Icon as={SecurityBoomi} boxSize="285px" />,
      Action: () => {
        const scheduleMeeting = useContactSales();
        return (
          <Grid gap={3}>
            <Flex gap={1} alignItems="baseline">
              <RiveryButton
                variant="link"
                label="Learn more"
                href="https://help.boomi.com/docs/category/security"
                target="_blank"
              />{' '}
              or
              <RiveryButton
                label="speak with our data experts"
                variant="link"
                onClick={scheduleMeeting}
              />
              for additional details
            </Flex>
            <UpgradeNowButton />
          </Grid>
        );
      },
    },
  };
};

export function EnableFeatureModal({
  feature,
  ...rest
}: EnableFeatureModalProps) {
  const isManagedByBoomi = useGetIsAccountThatIsManagedByBoomi();
  const configurations = getConfigurations(isManagedByBoomi);
  return (
    <Tagger tags={`upgrade-modal-${feature}`}>
      <RiveryModal
        title={null}
        centered
        ariaLabel="enable feature modal"
        style={{
          content: {
            padding: 0,
            pb: 6,
            maxWidth: '976px',
            bg: 'background-secondary',
          },
          body: {
            padding: 0,
          },
          header: {
            padding: 0,
            paddingRight: 2,
            border: 'none',
          },
        }}
        body={<UpgradeModal {...configurations[feature]} />}
        {...rest}
      />
    </Tagger>
  );
}

const UpgradeNowButton = () => {
  const [showPricingModal, togglePricingModal] = useToggle(false);
  return (
    <>
      <RiveryButton
        variant="primary"
        width="max-content"
        label="Upgrade Now"
        leftIcon={<Icon as={Crown} w={5} h={5} color="white" />}
        onClick={() => togglePricingModal(true)}
      />
      <TrialMessage
        togglePricingModal={togglePricingModal}
        showPricingModal={showPricingModal}
      />
    </>
  );
};

const VisitDocumentation = ({ to }: { to: string }) => {
  return (
    <Flex gap={1}>
      <Text>To learn more, visit our </Text>
      <ExternalLink label="blog" url={to} size="medium" />
    </Flex>
  );
};
