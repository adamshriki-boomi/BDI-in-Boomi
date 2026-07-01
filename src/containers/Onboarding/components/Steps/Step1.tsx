import { RiverTypes } from 'api/types';
import { RoutesBuilder } from 'app/routes';
import {
  ActionRiverIcon,
  Box,
  Center,
  DrawerKitIcon,
  ExternalLink,
  Flex,
  Grid,
  Icon,
  LogicIcon,
  RiveryButton,
  S2TIcon,
  Text,
} from 'components';
import { Tagger } from 'components/Tracking/Tagger';
import SvgActionNew from 'components/Icons/components/ActionNew';
import SvgLogicNew from 'components/Icons/components/LogicNew';
import SvgS2TNew from 'components/Icons/components/S2TNew';
import { useRiverBuilder } from 'containers/River/hooks/useRiverLoader';
import { MdOpenInNew } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useCore } from 'store/core';
import { useGroupsState } from 'store/groups';
import { getCrossId } from 'utils/api.sanitizer';
import { useRiverRouteBuilder } from 'utils/create-river.helpers';
import {
  getRiverCreationTag,
  RIVER_CREATION_TAG_ACTIONS,
} from 'utils/tracking.tags';
import { selectStyles } from './RiverBoxStyles';

export const DOCS_URL =
  'https://help.boomi.com/docs/Atomsphere/Data_Integration/';
export const riverItems = [
  {
    documentation: `${DOCS_URL}/Rivers/SourcetoTargetRiver/`,
    icon: SvgS2TNew,
    type: RiverTypes.SOURCE_TO_FZ,
    title: 'Source to Target Flow',
    description:
      'Extract & load data from any source into target data warehouse or other destination',
  },
  {
    documentation: `${DOCS_URL}Rivers/LogicRiver/LogicRiverOverview/logic-overview`,
    icon: SvgLogicNew,
    type: RiverTypes.LOGIC,
    title: 'Logic Flow',
    description:
      'Transform data using SQL and Python, and orchestrate automated data workflows',
  },
  {
    documentation: `${DOCS_URL}Rivers/ActionRiver/action-river-general-overview`,
    icon: SvgActionNew,
    type: RiverTypes.ACTION,
    title: 'Build Your Own',
    description:
      'Create custom REST connections with AI-powered agents for fast, low-code API integration',
  },
  {
    icon: DrawerKitIcon,
    type: 'Kits',
    title: 'Data Integration Kits',
    description:
      'Use instant data model templates to build end-to-end data solutions in minutes',
  },
];

export function RiverTypeBoxes({
  homePage = true,
  createDrawer = false,
  onDismissDrawer = null,
  partnerSignup = false,
  onRiverClick = null,
  ...flexProps
}) {
  const { isViewerRole, selectedAccountId: accountId, envId } = useCore();
  const isItemKits = item => item === 'Kits';
  const riverTypesItems = riverItems.filter(box => {
    if (isItemKits(box.type) && homePage) {
      return null;
    }
    if (box.type === 'actions' && partnerSignup) {
      return null;
    }
    return box;
  });

  const { createLinkByRiverType } = useRiverRouteBuilder();
  const { defaultGroup } = useGroupsState();
  const createRiver = useRiverBuilder();

  const getTagForRiverType = type => {
    const location = homePage ? 'home' : 'drawer';
    switch (type) {
      case RiverTypes.SOURCE_TO_FZ:
        return getRiverCreationTag(
          location,
          RIVER_CREATION_TAG_ACTIONS.SOURCE_TO_TARGET,
        );
      case RiverTypes.LOGIC:
        return getRiverCreationTag(
          location,
          RIVER_CREATION_TAG_ACTIONS.LOGIC_RIVER,
        );
      case RiverTypes.ACTION:
        return getRiverCreationTag(
          location,
          RIVER_CREATION_TAG_ACTIONS.BUILD_YOUR_OWN,
        );
      case 'Kits':
        return getRiverCreationTag(location, RIVER_CREATION_TAG_ACTIONS.KITS);
      default:
        return null;
    }
  };

  return (
    <Flex flexDir="column" gap={5} {...flexProps}>
      {!homePage && !createDrawer ? (
        <Flex flexDir="column" color="font" pt={2}>
          <Text>
            Data Flows are the primary building blocks in Boomi Data
            Integration.{' '}
          </Text>
          <Text>
            There are 3 types of Data Flows: Source to Target, Logic, and REST
            Action.
          </Text>
          <Text>
            Continue below and discover how those Data Flow types will help you
            to build your data pipelines.
          </Text>
        </Flex>
      ) : null}
      <Center>
        <Grid
          templateColumns={createDrawer ? 'unset' : 'repeat(3, 1fr)'}
          gap={6}
        >
          {riverTypesItems.map(
            ({ title, documentation, description, icon, type }, idx) => (
              <Tagger key={idx} tags={getTagForRiverType(type)}>
                <Grid
                  as={createDrawer && !isViewerRole ? Link : Grid}
                  whiteSpace="break-spaces"
                  onClick={() => {
                    if (onRiverClick) {
                      onRiverClick(type);
                    }
                    if (!partnerSignup && !isViewerRole) {
                      onDismissDrawer && onDismissDrawer();
                      if (type === RiverTypes.LOGIC) {
                        createRiver(getCrossId(defaultGroup), type);
                      }
                    }
                  }}
                  aria-label={type}
                  {...selectStyles(homePage, createDrawer).item}
                  {...(!partnerSignup && {
                    to: isItemKits(type)
                      ? RoutesBuilder.kits({ accountId, envId })
                      : createLinkByRiverType({ type: type as RiverTypes }),
                  })}
                >
                  <Center>
                    <Icon
                      as={icon}
                      {...selectStyles(homePage, createDrawer).icon}
                    />
                  </Center>
                  <Flex
                    gap={1}
                    flexDir="column"
                    textAlign={homePage ? 'center' : 'left'}
                  >
                    <Text textStyle="M7">{title}</Text>
                    <Text textStyle="R8" color="font-secondary">
                      {description}
                    </Text>
                  </Flex>
                  {homePage ? (
                    <Center>
                      <RiveryButton
                        label={
                          type === RiverTypes.ACTION ? title : `Create ${title}`
                        }
                        size="small"
                        variant="outlined-primary"
                        as={!isViewerRole ? Link : Grid}
                        to={createLinkByRiverType({ type: type as RiverTypes })}
                        isDisabled={isViewerRole}
                      />
                    </Center>
                  ) : !createDrawer ? (
                    <Box ml="auto">
                      <ExternalLink
                        label="Read More"
                        rightIcon={<Icon as={MdOpenInNew} />}
                        url={documentation}
                      />
                    </Box>
                  ) : null}
                </Grid>
              </Tagger>
            ),
          )}
        </Grid>
      </Center>
    </Flex>
  );
}

const riverItemsMap = {
  [RiverTypes.SOURCE_TO_FZ]: S2TIcon,
  [RiverTypes.LOGIC]: LogicIcon,
  [RiverTypes.ACTION]: ActionRiverIcon,
};

export const riverItemsSmall = riverItems
  .map(item => ({
    ...item,
    icon: riverItemsMap[item.type],
  }))
  .filter(({ type }) => type !== 'Kits');
