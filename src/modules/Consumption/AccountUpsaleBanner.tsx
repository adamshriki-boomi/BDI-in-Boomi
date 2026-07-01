import { Box, Image } from '@chakra-ui/react';
import { getDataV1 } from 'api/api.proxy';
import { PlansIds } from 'api/types';
import { RoutesBuilder } from 'app/routes';
import { Flex, RenderGuard, RiveryButton, Text } from 'components';
import { useContactSales } from 'hooks/useContactSales';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAsyncFn } from 'react-use';
import { useCore } from 'store/core';
import Enterprise from './Images/enterprise.png';
import EnterpriseBoomi from './Images/enterprise_boomi.svg';
import Magic from './Images/magic.png';
import MagicBoomi from './Images/magic_boomi.svg';
import PythonImage from './Images/python.png';
import PythonBoomi from './Images/python_boomi.svg';
import StarterHighRPU from './Images/savings.png';
import StarterHighRPUBoomi from './Images/starter_rpu_boomi.svg';
import TrialHasRivers from './Images/trial_has_rivers.png';
import TrialNoRivers from './Images/trial_no_rivers.png';
import BoomiTrial from './Images/trial_no_rivers_boomi.svg';

const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';

function TrialAccountUpsale({ accountId, envId }) {
  const { registrationDate } = useCore();
  const today = new Date();
  const scheduleMeeting = useContactSales();
  const [{ value }, getStatistics] = useAsyncFn(() =>
    getDataV1(true, '/activities_statistics', {
      start_time: registrationDate * 1000,
      end_time: today.getTime(),
    }),
  );

  useEffect(() => {
    if (!value) {
      getStatistics();
    }
  }, [getStatistics, value]);

  const hasSuccessfullRuns = value?.succeeded > 0;

  return hasSuccessfullRuns
    ? {
        image: exoTheme ? EnterpriseBoomi : TrialHasRivers,
        header: 'Do More With Your Data',
        description: `Sync Tableau, Push insights to Slack, Find data models, it’s all here.`,
        button: {
          label: 'Explore our Workflows',
          props: {
            as: Link,
            to: RoutesBuilder.kits({ accountId, envId }),
          },
        },
      }
    : {
        image: exoTheme ? BoomiTrial : TrialNoRivers,
        header: 'Let’s Simplify Your Data Flow',
        description:
          'Still working on your first data pipeline? We are here to help',
        button: {
          label: 'Contact a Data Expert',
          props: { onClick: scheduleMeeting },
        },
      };
}

function SwitchToAnnual() {
  const scheduleMeeting = useContactSales();
  return {
    image: exoTheme ? StarterHighRPUBoomi : StarterHighRPU,
    header: 'Save $$$ with Annual Billing',
    description: `Based on your usage data, you may unlock some savings switching to annual billing`,
    button: {
      label: 'Contact Sales',
      props: {
        w: '120px',
        onClick: scheduleMeeting,
      },
    },
  };
}

function StarterPAYGUpsale({ rpuUsage }) {
  const highRpuUsage = rpuUsage?.current > 1350 || rpuUsage?.previous > 1350;
  return highRpuUsage ? SwitchToAnnual() : BaseToProfessionalUpsale();
}

function BaseToProfessionalUpsale() {
  const scheduleMeeting = useContactSales();
  return {
    image: exoTheme ? PythonBoomi : PythonImage,
    header: 'Unbox Your Python Today',
    description: (
      <Flex flexDir="column" color="font-secondary" gap={1}>
        <Text textStyle="M6">Self-managing your Python?</Text>
        <Text textStyle="R7">
          Take a look at our professional plan and integrate your Python scripts
          with the rest of your data flows
        </Text>
      </Flex>
    ),
    button: {
      label: 'Contact a Data Expert',
      props: {
        onClick: scheduleMeeting,
      },
    },
  };
}

function ProfessionalToEnterpriseUpsale() {
  const scheduleMeeting = useContactSales();
  return {
    image: exoTheme ? MagicBoomi : Magic,
    header: 'Unleash your magic powers',
    description:
      'Experience our greatest plan yet! Enjoy unlimited environments, high-frequency data replication and so much more',
    button: {
      label: 'Contact a Data Expert',
      props: {
        onClick: scheduleMeeting,
      },
    },
  };
}

function ProfPAYGUpsale({ rpuUsage }) {
  const highRpuUsage = rpuUsage?.current > 800 || rpuUsage?.previous > 800;
  return highRpuUsage ? SwitchToAnnual() : ProfessionalToEnterpriseUpsale();
}

function EnterpriseUpsale({ accountId, envId }) {
  return {
    image: exoTheme ? EnterpriseBoomi : Enterprise,
    header: 'Keep Doing What You Love',
    description: `What else can you do with your data? Need some inspiration? Take a look at our starter kits`,
    button: {
      label: 'Review Kits',
      props: {
        w: '100px',
        as: Link,
        to: RoutesBuilder.kits({ accountId, envId }),
      },
    },
  };
}

function StandardUpsale() {
  const scheduleMeeting = useContactSales();
  return {
    image: exoTheme ? EnterpriseBoomi : Enterprise,
    header: 'Keep Doing What You Love',
    description: `What else can you do with your data? Need some inspiration? Contact Us for more information`,
    button: {
      label: 'Contact a Data Expert',
      props: {
        onClick: scheduleMeeting,
      },
    },
  };
}

const upsaleBannerContent = ({ accountId, envId, rpuUsage }) => {
  // TODO remove legacy pricing - irrelevant plans
  return {
    [PlansIds.TRIAL]: TrialAccountUpsale({ accountId, envId }),
    [PlansIds.STARTER]: StarterPAYGUpsale({ rpuUsage }),
    [PlansIds.STARTER_ANNUAL]: BaseToProfessionalUpsale(),
    [PlansIds.PROFESSIONAL_PAYG]: ProfPAYGUpsale({
      rpuUsage,
    }),
    [PlansIds.PROFESSIONAL_ANNUAL]: ProfessionalToEnterpriseUpsale(),
    [PlansIds.ENTERPRISE]: EnterpriseUpsale({ accountId, envId }),
    [PlansIds.STANDARD]: StandardUpsale(),
    [PlansIds.BASE_2025]: BaseToProfessionalUpsale(),
    [PlansIds.PROFESSIONAL_2025]: ProfessionalToEnterpriseUpsale(),
    [PlansIds.PRO_PLUS_2025]: ProfessionalToEnterpriseUpsale(),
    [PlansIds.ENTERPRISE_2025]: EnterpriseUpsale({ accountId, envId }),
  };
};

export function UpsaleBanner({ type = null, rpuUsage }) {
  const { activeAccountId: accountId, envId } = useCore();
  const content = upsaleBannerContent({
    accountId,
    envId,
    rpuUsage,
  });

  return (
    <Flex
      boxShadow="md"
      borderRadius={4}
      flexDir="column"
      w="full"
      h="fit-content"
      aria-label="account-upsale-banner"
      alignItems="center"
      position="relative"
    >
      <RenderGuard condition={exoTheme}>
        <Box
          position="absolute"
          w="full"
          h="140px"
          bg="linear-gradient(45deg, #A03291 0%, #FF7C66 100%)"
          borderRadius="4px 4px 20px 20px"
        />
      </RenderGuard>
      <Image
        src={content[type].image}
        zIndex={1}
        {...(!exoTheme
          ? { mt: '-45px' }
          : {
              boxSize: '145px',
              mt: 12,
              borderRadius: '10px',
            })}
      />
      <Flex
        textAlign="center"
        flexDir="column"
        gap={6}
        p={6}
        justify="space-between"
      >
        <Flex flexDir="column" gap={3} flex={1}>
          <Text textStyle="B4" className="brand-title" px={8}>
            {content[type].header}
          </Text>
          {content[type].description === typeof 'string' ? (
            <Text textStyle="R6">{content[type].description}</Text>
          ) : (
            content[type].description
          )}
        </Flex>
        <RiveryButton
          alignSelf="center"
          label={content[type].button.label}
          variant="default"
          {...content[type].button.props}
        />
      </Flex>
    </Flex>
  );
}
