import { SimpleGrid, Tag } from '@chakra-ui/react';
import { RiverTypes, SourceTypes } from 'api/types';
import {
  Box,
  Button,
  Center,
  Link as ChakraLink,
  Flex,
  Grid,
  HStack,
  Icon,
  Image,
  InfoTooltip,
  RenderGuard,
  RestApiIcon,
  RiveryButton,
  RiveryInfoTooltip,
  Tab,
  TabList,
  Tabs,
  Text,
  Crown,
} from 'components';
import { Tagger } from 'components/Tracking/Tagger';
import { FormTypes, ModalForm, useIsTargetOpenForBlueprint } from 'modules';
import { useSttSource } from 'modules/SourceTarget';
import { Link } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useRiverRouteBuilder } from 'utils/create-river.helpers';
import { RiverCreationTags, S2TTags } from 'utils/tracking.tags';
import { useAccount } from 'store/core';
import { EnableFeatureModal } from 'containers/Login/components/EnableFeatureModal';

function CategoryTab({
  name,
  setCategory,
}: {
  name: string;
  setCategory: (name) => void;
}) {
  return (
    <Tab
      id={name}
      height="55px"
      w="200px"
      justifyContent="start"
      borderInlineEnd="2px solid"
      borderInlineStart="none"
      borderInlineEndColor="transparent"
      borderRadius="4px 0px 0px 4px!important"
      onClick={() => setCategory(name)}
    >
      <Text>{name}</Text>
    </Tab>
  );
}

const DisplayLabelMap = {
  new: { variant: 'contained-green' },
  sunset: { variant: 'contained-pink' },
  alpha: { variant: 'contained-blue' },
  beta: { variant: 'contained-green' },
  coming_soon: { varian: 'yellow' },
};

// Pendo locator ids for specific source cards, keyed by api_name
const sourcePendoIdMap = {
  blueprint_copilot: S2TTags.DATA_CONNECTOR_AGENT_BUTTON,
  boomi_for_sap: S2TTags.SAP_BUTTON,
};

export function SourceComponent({
  description,
  tooltipIcon: TooltipIcon = InfoTooltip,
  showTooltip = true,
  icon,
  hoverIcon = null,
  name,
  labels = null,
  onClick,
  type,
  api_name,
}) {
  const source = useSttSource();
  const allowedTargetsForBP = useIsTargetOpenForBlueprint(type);
  const blockedByBlueprint =
    type === 'Target' &&
    [SourceTypes.BLUEPRINT, 'blueprint_copilot'].includes(source?.name) &&
    !allowedTargetsForBP.includes(api_name?.toLowerCase());
  const { isSourceBlocked } = useIsBlockedSource(api_name);
  const [openUpgradeModal, toggleUpgradeModal] = useToggle(false);

  return (
    <Box
      h="150px"
      maxW="180px"
      bg="background-secondary"
      border="1px solid"
      borderColor="background-secondary"
      as={Button}
      data-pendo-id={sourcePendoIdMap[api_name]}
      pointerEvents={blockedByBlueprint ? 'none' : 'auto'}
      p={3}
      onClick={() => {
        if (isSourceBlocked) {
          toggleUpgradeModal(true);
          return;
        }
        onClick();
      }}
      _hover={{
        bg: 'background-secondary',
        boxShadow:
          '0px 10px 15px -3px rgba(0, 0, 0, 0.10), 0px 4px 6px 0px rgba(0, 0, 0, 0.05)',

        borderColor: 'border',
        boxSizing: 'border-box',
        '& #sourceIcon': { display: hoverIcon ? 'none' : 'block' },
        '& #sourceHoverIcon': { display: hoverIcon ? 'block' : 'none' },
      }}
      sx={{
        ...(blockedByBlueprint && {
          '& .source-image-description': { opacity: 0.35 },
        }),
        '&:hover .chakra-icon': {
          display: 'block',
        },
      }}
      position="relative"
    >
      <RenderGuard condition={isSourceBlocked}>
        <Icon
          as={Crown}
          boxSize="22px"
          position="absolute"
          right="12px"
          top="12px"
          color="coral"
          transition="right 0.2s"
          sx={{
            '.chakra-button:hover &': {
              right: '32px',
            },
          }}
        />
      </RenderGuard>
      <Grid alignItems="center" templateRows="22px 70px 1fr" w="full" h="full">
        <HStack justify="space-between" alignItems="baseline" w="full" h="20px">
          <RenderGuard condition={Boolean(labels?.length)} fallback={<Box />}>
            <HStack>
              {labels?.map((control, index) => {
                const AI = control === 'AI Assistant, Try Now!';
                return (
                  <Tag
                    className="source-image-description"
                    key={index}
                    w="fit-content"
                    textTransform="capitalize"
                    {...(AI && { fontWeight: 'normal' })}
                    {...(!blockedByBlueprint && DisplayLabelMap[control])}
                  >
                    {control.replace('_', ' ')}
                  </Tag>
                );
              })}
            </HStack>
          </RenderGuard>
          {showTooltip ? (
            <RiveryInfoTooltip
              buttonProps={{
                as: 'div',
                h: '16px!important',
                minW: '2px!important',
              }}
              description={description}
              icon={
                <Icon
                  as={TooltipIcon}
                  color="font"
                  boxSize={4}
                  display="none"
                />
              }
              placement="right"
              ariaLabel={`${name}`}
              extraProps={{
                contentProps: {
                  maxW: '200px',
                },
              }}
            />
          ) : null}
        </HStack>
        <Center>
          <Image
            id="sourceHoverIcon"
            className="source-image-description"
            src={hoverIcon}
            h="55px"
            display="none"
          />
          <Image
            id="sourceIcon"
            className="source-image-description"
            src={icon}
            h="55px"
          />
        </Center>
        <Text
          className="source-image-description"
          textStyle="M7"
          whiteSpace="break-spaces"
        >
          {name}
        </Text>
      </Grid>
      <EnableFeatureModal
        feature="boomiForSap"
        show={openUpgradeModal}
        toggle={toggleUpgradeModal}
      />
    </Box>
  );
}

// insert here future flags by source api_nam
const sourceSettingsMap = {
  boomi_for_sap: 'allow_boomi_for_sap',
};

const useIsBlockedSource = api_name => {
  const { isSettingOn } = useAccount();

  if (!api_name) {
    return { isSourceBlocked: false };
  }

  const settingKey = sourceSettingsMap[api_name];
  const isAllowed = settingKey ? isSettingOn(settingKey) : true;
  return { isSourceBlocked: settingKey && !isAllowed };
};

export function CategoriesTabs({ categories, setAndScroll }) {
  return (
    <Tabs orientation="vertical">
      <TabList
        borderInlineEnd="1px solid"
        borderInlineEndColor="gray.300"
        borderInlineStart="none"
      >
        <CategoryTab
          setCategory={value => setAndScroll('category', value)}
          name="All"
        />
        {categories.map(({ section_name }, id) => (
          <CategoryTab
            setCategory={value => setAndScroll('category', value)}
            key={`${section_name}-${id}`}
            name={section_name}
          />
        ))}
      </TabList>
    </Tabs>
  );
}

export function SourcesGrid({
  connections = [],
  dataSources = [],
  categoryDescription,
  topRef,
  onSelect,
  type,
}) {
  return (
    <Grid
      h="fit-content"
      maxH="100%"
      w="100%"
      gridTemplateRows="min-content 1fr"
    >
      <Text color="font-secondary">{categoryDescription}</Text>
      <RenderGuard
        condition={Boolean(connections) && dataSources?.length !== 0}
        fallback={<CreateYourOwn type={type} />}
      >
        <SimpleGrid
          templateColumns="repeat(auto-fit, 170px)"
          spacing={4}
          overflowY="auto"
          overflowX="hidden"
          ref={topRef}
        >
          {dataSources?.map((source, idx) => (
            <SourceComponent
              type={type}
              key={`${idx}-${source?.name}`}
              {...source}
              description={
                <Box>
                  {source?.description}{' '}
                  <ChakraLink
                    href={source?.documentation_url}
                    target="_blank"
                    color="font-inverse"
                    display="block"
                    fontWeight="medium"
                    fontSize="xs"
                    mx="auto"
                    onClick={e => e.stopPropagation()}
                    textDecoration="underline"
                  >
                    Read More
                  </ChakraLink>
                </Box>
              }
              onClick={() => onSelect(source)}
            />
          ))}
        </SimpleGrid>
      </RenderGuard>
    </Grid>
  );
}

function CreateYourOwn({ type }) {
  const [showForm, setShowForm] = useToggle(false);
  const { createLinkByRiverType } = useRiverRouteBuilder();
  const isSource = type === 'Source';
  return (
    <Flex
      flexDir="column"
      w="full"
      h="full"
      alignItems="center"
      gap={4}
      {...(!isSource && { mt: 16 })}
    >
      <Icon as={RestApiIcon} boxSize="135px" />
      <RenderGuard
        condition={isSource}
        fallback={
          <Text textStyle="M5" color="purple.300">
            Missing a Data {type}?
          </Text>
        }
      >
        <Flex flexDir="column" textAlign="center">
          <Text textStyle="M5" color="purple.300">
            Connect any Data Source with the AI Data Connector
          </Text>
          <Text color="font-secondary" textStyle="R7">
            Use <strong>Blueprint</strong> or{' '}
            <strong>Data Connector Agent </strong> to create your own
            integration in minutes - no engineering required.
          </Text>
        </Flex>
      </RenderGuard>
      <RenderGuard
        condition={isSource}
        fallback={
          <RiveryButton
            fontSize="sm"
            variant="primary"
            label={`Request a New Data ${type}`}
            onClick={setShowForm}
          />
        }
      >
        <Flex flexDir="column" w="full" h="full" alignItems="center" gap={2}>
          <Box>
            <Tagger tags={RiverCreationTags.HOME_BUILD_MY_OWN}>
              <RiveryButton
                label="I want to build my own!"
                as={Link}
                to={createLinkByRiverType({ type: 'actions' as RiverTypes })}
              />
            </Tagger>
          </Box>
          <Box>
            or
            <Tagger tags={RiverCreationTags.HOME_REQUEST_DATA_SOURCE}>
              <RiveryButton
                fontSize="sm"
                mx="3px"
                variant="link"
                size="small"
                label={`Request a New Data ${type}`}
                onClick={setShowForm}
              />
            </Tagger>
          </Box>
        </Flex>
      </RenderGuard>
      <ModalForm
        title={`Request a new Data ${type}`}
        show={showForm}
        toggle={() => setShowForm(false)}
        type={FormTypes.REQUEST_NEW_INTEGRATION}
      />
    </Flex>
  );
}
