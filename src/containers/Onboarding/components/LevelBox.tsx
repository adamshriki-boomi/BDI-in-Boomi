import { ExLoader, LoaderSize } from '@boomi/exosphere';
import {
  Box,
  Center,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Grid,
  Icon,
  Slide,
} from '@chakra-ui/react';
import { AppRoutes, LegacyRoutes, paramsReplacer } from 'app/routes';
import { Image, Text } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import {
  Levelup1,
  Levelup2,
  Levelup3,
  Levelup4,
} from 'components/Icons/components';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { imageSrc } from '../consts';
import VideoModal from './VideoModal';

export function LevelBox({ ...item }) {
  const { text, icon } = item;
  const [show, toggleShow] = useToggle(false);
  return (
    <>
      <RiveryButton
        px={4}
        py={2}
        w="245px"
        h="70px"
        variant="default"
        color="font"
        label={
          <Text textStyle="R7" whiteSpace="pre-wrap" pl={2}>
            {text}
          </Text>
        }
        textAlign="left"
        leftIcon={<Icon as={icon} w="34px" h="30px" color="primary" />}
        _hover={{
          color: 'background-action-hover',
          borderColor: 'background-action-hover',
          shadow: 'md',
          '& .chakra-text': {
            fontWeight: 'medium',
          },
        }}
        onClick={toggleShow}
      />
      <Drawer
        size="default"
        variant="drawer"
        placement="right"
        onClose={toggleShow}
        isOpen={show}
      >
        <DrawerOverlay />
        <LevelUpContent toggle={toggleShow} {...item} />
      </Drawer>
    </>
  );
}

export function LevelUpContent({
  resourceCenter = false,
  toggle,
  levelUpContent = null,
  ...rest
}) {
  const { selectedAccountId: account, envId: env, isAdminRole } = useCore();
  const { push } = useHistory();
  const url = useCallback(
    path => paramsReplacer(path)({ account, env }),
    [account, env],
  );

  let level;
  if (resourceCenter) {
    level = levelUpContent;
  } else {
    level = rest;
  }

  const Component = level?.component;

  return (
    <ResourceCenterWrapper resourceCenter={resourceCenter}>
      {!(level?.text || level?.title) ? (
        <Flex h="full" justify="center" alignItems="center" w="full">
          <ExLoader size={LoaderSize.MEDIUM} />
        </Flex>
      ) : (
        <Flex flexDir="column" h="full">
          <LevelUpContentHeader
            icon={level.icon}
            title={level.text}
            headerImage={level.headerImage}
          />
          <Flex
            bg="white"
            flexDir="column"
            height="calc(100vh - 270px)"
            overflow="auto"
            borderTop="1px"
            borderTopColor="border-contrast"
          >
            <Flex flexDir="column" color="font" p={6} gap={2}>
              <Box
                dangerouslySetInnerHTML={{ __html: level?.description }}
                sx={{
                  '& a': {
                    color: 'primary',
                    fontWeight: 'medium',
                  },
                  '& #api_list, #environments_list, #etl_list': {
                    paddingLeft: '32px',
                  },
                }}
              />
              {level?.component && <Component />}
              <Center pt={6}>
                <VideoModal
                  videoImage={level.image}
                  title={level.text}
                  brightcoveVideoId={level.brightcoveVideoId}
                  videoBgColor={level.videoBgColor}
                />
              </Center>
            </Flex>
          </Flex>
        </Flex>
      )}
      {resourceCenter ? null : (
        <RiveryDrawerFooter
          handleOnClose={toggle}
          handleOnSuccess={() => push(url(level?.onDrawerActionLink))}
          saveLabel={
            !level?.saveLabel || (!isAdminRole && level?.admin)
              ? null
              : rest.saveLabel
          }
          cancelLabel="Close"
        />
      )}
    </ResourceCenterWrapper>
  );
}

export function LevelUpContentHeader({
  icon,
  title,
  headerImage,
  resourceCenterImage = null,
  gridProps = null,
}) {
  return (
    <Grid
      bg="background-secondary"
      px={8}
      py={6}
      templateColumns="repeat(2, 1fr)"
      {...gridProps}
    >
      <Flex flexDir="column" gap={2}>
        <Icon as={icon} boxSize="28px" color="primary" />
        <Text textStyle="M4" fontWeight="600" pr={6}>
          {title}
        </Text>
      </Flex>
      {resourceCenterImage ? (
        resourceCenterImage
      ) : (
        <Image src={imageSrc(headerImage)} ml="auto" h="104px" w="127px" />
      )}
    </Grid>
  );
}

function ResourceCenterWrapper({ resourceCenter, children }) {
  return resourceCenter ? (
    <Slide in direction="right" style={{ position: 'relative' }}>
      {children}
    </Slide>
  ) : (
    <DrawerContent>{children}</DrawerContent>
  );
}

export const LEVEL_UPS = {
  LevelUp1: {
    text: 'Deploy and manage your environments',
    icon: Levelup1,
    title: 'Deploy and manage your environments',
    description:
      'With Environments, teams build walled off workspaces to achieve their unique data management architecture.' +
      '<br/><br/> Companies large and small use Environments for countless initiatives,' +
      "including these popular use cases: <ul id='environments_list'><li>Internal workspaces, separated by department," +
      'team, or project.</li><li>Workspaces for each phase of the development lifecycle (Dev, Test/QA, Stage, Prod).' +
      '</li><li>External workspaces or OEM, wherein each outside client has his or her own environment (Multi-tenancy).' +
      '</li></ul> Moving content between environments (i.e. from Dev to Prod) is easy using deployment packages so you' +
      'can spend less time deploying and more time creating.<br/><br/> For more information watch this video:',
    saveLabel: 'Create Environment',
    admin: true,
    onDrawerActionLink: `${AppRoutes.ENVIRONMENTS}?tab=manager`,
    headerImage: 'onboarding_environments',
    image: 'Env_Deployment',
    brightcoveVideoId: '6374537148112',
    videoBgColor: 'yellow.400',
  },
  LevelUp2: {
    text: 'Connect to anywhere using REST API',
    icon: Levelup2,
    description:
      'With our <strong>REST Action</strong>, you can pull data from any REST API in a few clicks and' +
      ' ingest the data straight into your data warehouse.<br/><br/>Try out REST Action by using your own REST API,' +
      "<br/>or alternativly, extract data from any <a href='https://apipheny.io/free-api/'>Free API</a> and load it" +
      ' into your Data Warehouse.<br/><br/>For more information visit' +
      " <a href='https://help.boomi.com/docs/Atomsphere/Data_Integration/Rivers/ActionRiver/action-rest-api-use-case' target='_blank'>REST Action</a> and" +
      " <a href='https://help.boomi.com/docs/Atomsphere/Data_Integration/Sources/RestAPI/walkthrough-actions' target='_blank'>" +
      'Action Use Case </a><br/>or watch REST Action demo video below.',
    saveLabel: 'Create REST Action',
    onDrawerActionLink: `${
      LegacyRoutes.CREATE_RIVER
    }?selected_river_type=actions&cacheSlayer=${new Date().getTime()}`,
    headerImage: 'onboarding_rest_api',
    image: 'Connector',
    brightcoveVideoId: '6374535385112',
    videoBgColor: 'red.200',
  },
  LevelUp3: {
    text: 'Activate your data with Reverse ETL',
    icon: Levelup3,
    description:
      'ETL and ELT both transfer data from third party systems, such as business applications (Hubspot,' +
      'Salesforce) and databases (Oracle, MySQL), into target data warehouses.<br/><br/>But with <strong>Reverse ETL' +
      "</strong>, the <a href='https://rivery.io/blog/5-benefits-of-a-cloud-data-warehouse-for-marketing-teams/'" +
      " target='_blank'>data warehouse</a> is the source, rather than the target. The target is a third party system." +
      ' In Reverse ETL, data is extracted from the data warehouse, transformed inside the warehouse to meet the data' +
      ' formatting requirements of the third party system, and then loaded into the third party system for action' +
      " taking.<br/><br/>The applications of Reverse ETL are numerous, but some examples include:<ul id='etl_list'>" +
      "<li>Syncing internal support channels with <a href='https://rivery.io/integration/zendesk/' target='_blank'>" +
      'Zendesk</a> to prioritize customer service</li><li>Pushing customer data to' +
      " <a href='https://rivery.io/integration/salesforce/' target='_blank'>Salesforce </a>to enhance the sales" +
      ' process</li><li>Combining support, sales, and product data in' +
      " <a href='https://rivery.io/integration/hubspot/' target='_blank'>Hubspot</a> to personalize marketing" +
      ' campaigns for customers.</li></ul><br/>For more information watch this video:',
    headerImage: 'onboarding_reverse_etl',
    image: 'Reverse_ETL',
    brightcoveVideoId: '6374537444112',
    videoBgColor: 'red.100',
  },
  LevelUp4: {
    text: 'Build solutions using the API',
    icon: Levelup4,
    description:
      'By using the API, you can automate and streamline your data management processes' +
      ' programmatically.<br/>For example:<br/>Automate Data Flow executions, check their status from other platforms' +
      ' and embed data pipelines into the fabric of your product user experience.<br/><br/>To get started:<br/>First,' +
      ' create a token to authenticate to the API.<br/>Next, set up you first call to trigger a Data Flow.' +
      '<br/><br/>For more information on the API, visit our' +
      " <a href='https://api.rivery.io/documentation#section/Rivery-API-documentation' target='_blank'>" +
      'documentation</a><br/>or watch this video:',
    headerImage: 'onboarding_solutions',
    image: 'Solutions',
    brightcoveVideoId: '6374535976112',
    videoBgColor: 'blue.200',
  },
};
