import { RiverTypes } from 'api/types';
import { RoutesBuilder } from 'app/routes';
import { Box, Flex, Grid, Icon } from 'components';
import { ExoText } from 'components/Exosphere/ExoText';
import { Tagger } from 'components/Tracking/Tagger';
import { riverItems } from 'containers/Onboarding/components/Steps/Step1';
import { Link } from 'react-router-dom';
import { useCore } from 'store/core';
import { useRiverRouteBuilder } from 'utils/create-river.helpers';
import { DashboardCreateTags } from 'utils/tracking.tags';

const getTagForRiverType = (type: string) => {
  switch (type) {
    case RiverTypes.SOURCE_TO_FZ:
      return DashboardCreateTags.SOURCE_TO_TARGET_CARD;
    case RiverTypes.LOGIC:
      return DashboardCreateTags.LOGIC_RIVER_CARD;
    case RiverTypes.ACTION:
      return DashboardCreateTags.BUILD_YOUR_OWN_CARD;
    case 'Kits':
      return DashboardCreateTags.KITS_CARD;
    default:
      return '';
  }
};

export function DashboardRiverCreationCards() {
  const { selectedAccountId: accountId, envId } = useCore();
  const { createLinkByRiverType } = useRiverRouteBuilder();

  return (
    <Grid templateColumns="repeat(4, 1fr)" gap="var(--exo-spacing-large, 24px)">
      {riverItems.map(({ title, description, icon, type }) => {
        const isKits = type === 'Kits';
        const linkTo = isKits
          ? RoutesBuilder.kits({ accountId, envId })
          : createLinkByRiverType({ type: type as RiverTypes });
        const tag = getTagForRiverType(type);
        return (
          <Tagger key={type} tags={tag}>
            <Box
              as={Link}
              to={linkTo}
              bg="background"
              border="1px solid"
              borderColor="border-secondary"
              borderRadius="var(--exo-spacing-x-small, 8px)"
              p={4}
              h="full"
              cursor="pointer"
              _hover={{
                bg: 'exo-color-background-secondary',
                borderColor: 'exo-color-border',
                boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.15)',
              }}
            >
              <Flex
                gap="var(--exo-spacing-small, 12px)"
                h="full"
                alignItems="center"
              >
                <Icon as={icon} w="60px" h="50px" />

                <Flex flexDir="column" gap="var(--exo-spacing-2x-small, 4px)">
                  <ExoText styleName="Body Small 1 Bold">{title}</ExoText>
                  <ExoText
                    styleName="Caption"
                    color="var(--exo-color-font-secondary)"
                  >
                    {description}
                  </ExoText>
                </Flex>
              </Flex>
            </Box>
          </Tagger>
        );
      })}
    </Grid>
  );
}
