import { getData } from 'api/api.proxy';
import { AppRoutes } from 'app/routes';
import { Box, Flex, Grid, Icon, RiveryButton, Text } from 'components';
import {
  BookOpen,
  InfoIcon,
  NoriversDefault,
  RdsStatusMonitor,
} from 'components/Icons/components';
import SvgSupport from 'components/Icons/components/Support';
import { RiverName } from 'containers/Rivers/components/RiversColumnsComponents';
import { generatePath, Link } from 'react-router-dom';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';
import { ExternalLinks, RiversListSpinner } from './components';

export function RightSideHomePage() {
  return (
    <Grid gap={6} templateColumns="8px 1fr" h="full">
      <Box borderLeft="1px" borderColor="gray.200" h="full" />
      <Grid pt={6} templateRows="minmax(285px, max-content) 1fr" gap={5}>
        <RecentlyModifiedRivers />
        <QuickLinks />
      </Grid>
    </Grid>
  );
}

function RecentlyModifiedRivers() {
  const { activeAccountId: account, envId: env } = useCore();
  const [{ value: riversArray, loading }, getRivers] = useAsyncFn(
    async (size = 5) => getData('/rivers', { page: 1, page_size: size }),
    [],
  );

  useEffectOnce(() => {
    getRivers();
  });

  const showMoreButton =
    riversArray?.total_rivers > 5 &&
    riversArray?.data?.length < 10 &&
    riversArray?.total_rivers > riversArray?.data?.length;
  const showLessButton = riversArray?.data?.length > 5;
  return (
    <Flex flexDir="column" gap={3} position="relative">
      <Text textStyle="M7">Recently Modified Data Flows</Text>
      <Flex flexDir="column" gap={3} pl={2}>
        {loading ? (
          <RiversListSpinner />
        ) : Boolean(riversArray?.data?.length) ? (
          riversArray?.data?.map(river => {
            const value = river?.river_definitions?.river_name;
            return (
              <RiverName
                key={getOId(river?.cross_id)}
                value={value}
                row={{ original: river }}
                nameStyle={{
                  maxW: '360px',
                }}
              />
            );
          })
        ) : (
          <Flex flexDir="column" alignItems="center" pt={6}>
            <Icon boxSize="80px" as={NoriversDefault} mb={2} />
            <Text textStyle="M5">No recent Data Flows yet</Text>
            <Text color="font-secondary" textStyle="M7" textAlign="center">
              Get ready for your first Data Flow.
              <br />
              Follow our tips to {''}
              <RiveryButton
                p={0}
                label="get started"
                variant="link"
                as={Link}
                to={generatePath(AppRoutes.ONBOARDING, { env, account })}
                mb={0.5}
              />
            </Text>
          </Flex>
        )}
      </Flex>
      {!loading && (showLessButton || showMoreButton) ? (
        <RiveryButton
          ml="auto"
          label={showMoreButton ? 'Show More' : 'Show Less'}
          variant="link"
          textDecoration="none"
          fontWeight="600"
          size="small"
          onClick={() => getRivers(showMoreButton ? 10 : 5)}
        />
      ) : null}
    </Flex>
  );
}

const quickLinks = [
  { icon: InfoIcon, text: 'Guides & Help', resourceCenter: true },
  {
    icon: BookOpen,
    text: 'Documentation',
    link: import.meta.env.VITE_DOCS_LINK,
  },
  {
    icon: RdsStatusMonitor,
    text: 'System Status',
    link: 'https://status.boomi.com/',
  },
  {
    icon: SvgSupport,
    text: 'Support Portal',
    onClick: () =>
      window.open('https://community.boomi.com/s/support', '_blank'),
  },
];

function QuickLinks() {
  return (
    <Flex flexDir="column" gap={2}>
      <Text textStyle="M7">Quick Links</Text>
      <Flex flexDir="column" gap={4}>
        {quickLinks.map(
          ({ icon, text, link, resourceCenter, ...rest }, idx) => (
            <ExternalLinks
              key={idx}
              text={text}
              link={link}
              icon={icon}
              resourceCenter={resourceCenter}
              onClick={rest && 'onClick' in rest ? rest.onClick : undefined}
            />
          ),
        )}
      </Flex>
    </Flex>
  );
}
