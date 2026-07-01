import { RiverTypes } from 'api/types';
import {
  AiMagic,
  BoomiDotLg,
  Box,
  Center,
  Flex,
  Grid,
  HStack,
  Icon,
  IconBuildYourOwn,
  PartBGgraphic,
  RdsSchema,
  RenderGuard,
  RestAction,
  RiveryButton,
  Tag,
} from 'components';
import { ExoText } from 'components/Exosphere/ExoText';
import { Link } from 'react-router-dom';
import { useRiverRouteBuilder } from 'utils/create-river.helpers';
import './Rivers.scss';
import { ActionSelectorTags } from 'utils/tracking.tags';
import { Tagger } from 'components/Tracking/Tagger';

export function RiverActionSelector() {
  const { createLinkByRiverType } = useRiverRouteBuilder();
  const s2tPath = createLinkByRiverType({ type: RiverTypes.SOURCE_TO_TARGET });

  const multiActionPath = createLinkByRiverType({
    type: RiverTypes.MULTI_ACTION as any,
  });
  const restActionPath = createLinkByRiverType({
    type: RiverTypes.REST_ACTION as any,
  });
  return (
    <Center
      flexDir="column"
      h="full"
      position="relative"
      overflow="hidden"
      gap={6}
    >
      <ExoText styleName="Headline 2 Bold">
        Build your connector in minutes
      </ExoText>
      <Box position="relative" zIndex={1}>
        <Flex
          className="agent-selector"
          alignItems="center"
          p={8}
          w="900px"
          h="200px"
          bg="white"
          shadow="0 12px 32px 0 rgba(0, 0, 0, 0.10)"
          gap={6}
          borderRadius="8px"
          position="relative"
        >
          <Icon as={IconBuildYourOwn} boxSize="100px" />
          <Flex flexDir="column" gap={2}>
            <ExoText styleName="Subhead 1 Bold">Data Connector Agent</ExoText>
            <ExoText color="font-secondary" styleName="Caption">
              Create a Data Flow by connecting any data source to generate a
              ready-to-run flow.
            </ExoText>
            <Box pt={4}>
              <Tagger tags={ActionSelectorTags.START_WITH_AI_BUTTON}>
                <RiveryButton
                  minH="40px"
                  label="Start with AI"
                  leftIcon={<Icon as={AiMagic} boxSize={6} />}
                  as={Link}
                  to={{
                    pathname: `${s2tPath}`,
                    search: `?selected_source=blueprint`,
                    state: { show_copilot: true },
                  }}
                />
              </Tagger>
            </Box>
          </Flex>
        </Flex>
      </Box>
      <Flex flexDir="column" align="center">
        <ExoText styleName="Caption" color="var(--exo-color-font-secondary)">
          Prefer manual setup? Try legacy REST Actions
        </ExoText>
        <Grid mt={6} templateColumns={`repeat(2, 1fr)`} gap={4}>
          <Tagger tags={ActionSelectorTags.REST_ACTION_CARD}>
            <ActionRiverCard
              icon={RestAction}
              title="REST Action"
              description="Call a single REST endpoint. Good for quick tests and simple actions. Manual auth/pagination config required."
              link={restActionPath}
            />
          </Tagger>
          <Tagger tags={ActionSelectorTags.MULTI_ACTION_FLOW_CARD}>
            <ActionRiverCard
              icon={RdsSchema}
              title="Multi Action Flow"
              description="Chain multiple REST actions in one flow. Best for complex, step-by-step automations. Manual setup required."
              link={multiActionPath}
            />
          </Tagger>
        </Grid>
      </Flex>
      <Icon
        as={PartBGgraphic}
        w="100vw"
        h="689px"
        position="absolute"
        top="-5rem"
        pointerEvents="none"
        zIndex={0}
        transform="rotate(180deg) scaleX(-1)"
      />
      <Icon
        as={BoomiDotLg}
        position="absolute"
        right="-2%"
        top="14%"
        pointerEvents="none"
        zIndex={0}
        boxSize="90px"
        transform="rotate(270deg)"
      />
      <Icon
        as={BoomiDotLg}
        position="absolute"
        left="15%"
        bottom="15%"
        pointerEvents="none"
        zIndex={0}
        boxSize="45px"
      />
      <Icon
        as={BoomiDotLg}
        position="absolute"
        right="5%"
        top="12%"
        pointerEvents="none"
        zIndex={0}
        boxSize="25px"
      />
    </Center>
  );
}

function ActionRiverCard({ icon, title, description, link, ...rest }) {
  return (
    <Flex
      flexDir="column"
      w="440px"
      h="100px"
      border="1px solid"
      borderColor="border-secondary"
      borderRadius="8px"
      bg="exo-color-page"
      p={4}
      gap={2}
      _hover={{
        boxShadow: '0 12px 32px 0 rgba(0, 0, 0, 0.10)',
        cursor: 'pointer',
      }}
      to={link}
      as={Link}
      {...rest}
    >
      <HStack>
        <Icon as={icon} color="exo-color-data-solid-navy" boxSize={6} mr={2} />
        <ExoText styleName="Body Small 1 SemiBold UI">{title}</ExoText>
        <RenderGuard condition={title === 'Multi Action Flow'}>
          <Tag variant="contained-gray" fontWeight="normal" borderRadius="50px">
            Advanced
          </Tag>
        </RenderGuard>
      </HStack>
      <ExoText styleName="Caption">{description}</ExoText>
    </Flex>
  );
}
