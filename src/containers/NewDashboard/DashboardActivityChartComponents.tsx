import { Box, Button, Center, Flex, Text } from '@chakra-ui/react';
import { ExLoader, LoaderSize } from '@boomi/exosphere';
import { Icon, NotificationsEmpty } from 'components';
import { RiveryButton } from 'components/Buttons';
import { ExoText } from '../../components/Exosphere/ExoText';
import { Link, generatePath } from 'react-router-dom';
import { AppRoutes } from 'app/routes';
import { useCore } from 'store/core';
import { RiverTypes } from 'api/types';
import { useRiverRouteBuilder } from 'utils/create-river.helpers';

/** Legend row displayed under the chart in source view. */
export function ChartLegend({
  sources,
  getColor,
  highlightedSource,
  onSourceClick,
}: {
  sources: string[];
  getColor: (source: string, index: number) => string;
  highlightedSource: string | null;
  onSourceClick: (source: string) => void;
}) {
  return (
    <Flex flexWrap="wrap" justifyContent="center" gap={3} mt={3} px={2}>
      {sources.map((source, index) => {
        const isHighlighted = highlightedSource === source;
        const color = getColor(source, index);
        return (
          <Flex
            key={source}
            alignItems="center"
            gap={2}
            onClick={() => onSourceClick(source)}
            as={Button}
            transition="all 0.2s ease"
            transform={isHighlighted ? 'scale(1.1)' : 'scale(1)'}
            bg={
              isHighlighted
                ? 'var(--exo-color-background-action-hover-weak)'
                : 'transparent'
            }
            px={isHighlighted ? '8px' : 0}
            py={isHighlighted ? '1px' : 0}
            borderRadius={isHighlighted ? '4px' : 0}
            _hover={{
              px: '8px',
              borderRadius: '4px',
            }}
            _active={{
              fontSize: '12px',
            }}
          >
            <Box
              boxSize={3}
              borderRadius="2px"
              bg={color}
              flexShrink={0}
              transition="all 0.3s ease"
            />
            <Box as="span" lineHeight="12px">
              <ExoText
                styleName={
                  isHighlighted ? 'Body Small 1 Bold' : 'Body Small 1 UI'
                }
                color="var(--exo-color-font-secondary)"
              >
                {source}
              </ExoText>
            </Box>
          </Flex>
        );
      })}
    </Flex>
  );
}

/** Render state shown when the dashboard endpoint returns 403/insufficient access. */
export function PermissionNeededState({
  onResetToDefault,
}: {
  onResetToDefault?: () => void;
}) {
  return (
    <Center h={340} flexDir="column" gap={4} px={4}>
      <ExoText styleName="Subhead 1 Bold">
        You need permission to access this view
      </ExoText>
      <ExoText styleName="Body Small 1" color="var(--exo-color-font-secondary)">
        Reset to default to view available data, or contact your administrator
        for access.
      </ExoText>
      {onResetToDefault && (
        <RiveryButton
          label="Reset to default"
          size="sm"
          onClick={onResetToDefault}
        />
      )}
    </Center>
  );
}

/** Render state shown while the dashboard data is loading/fetching. */
export function LoadingState() {
  return (
    <Center h={340} flexDir="column" gap={2}>
      <ExLoader size={LoaderSize.MEDIUM} />
      <ExoText styleName="Body Small 1 SemiBold UI">Loading...</ExoText>
    </Center>
  );
}

/** Render state shown when the dashboard data request errors. */
export function ErrorState({ message }: { message: string }) {
  return (
    <Center h={340} flexDir="column" gap={2}>
      <Text color="exo-red-60" fontWeight="semibold">
        Error loading data
      </Text>
      <Text color="font-secondary" fontSize="sm" textAlign="center" px={4}>
        {message}
      </Text>
    </Center>
  );
}

/** Render state shown when the current filters yield no results. */
export function DashboardEmptyState({
  onResetToDefault,
}: {
  onResetToDefault?: () => void;
}) {
  return (
    <Center h={340}>
      <Flex
        flexDir="column"
        alignItems="center"
        textAlign="center"
        maxW="520px"
        gap={3}
      >
        <Icon as={NotificationsEmpty} boxSize="90px" />
        <ExoText styleName="Subhead 1 Bold">No Results</ExoText>
        <ExoText
          styleName="Body Small 1"
          color="var(--exo-color-font-secondary)"
        >
          Reset your current filters and try again
        </ExoText>
        {onResetToDefault && (
          <RiveryButton label="Show All Results" onClick={onResetToDefault} />
        )}
      </Flex>
    </Center>
  );
}

/** Render state shown when there are no rivers at all in the account. */
export function NoRiversState() {
  const { selectedAccountId: account, envId: env } = useCore();
  const { createLinkByRiverType } = useRiverRouteBuilder();
  const createRiverLink = createLinkByRiverType({
    type: RiverTypes.SOURCE_TO_TARGET,
  });

  return (
    <Center h={340}>
      <Flex
        flexDir="column"
        alignItems="center"
        textAlign="center"
        maxW="520px"
        gap={3}
      >
        <Icon as={NotificationsEmpty} boxSize="90px" />
        <ExoText styleName="Subhead 1 Bold">Let’s Get Started</ExoText>
        <RiveryButton
          label="Create Your First Data Flow"
          as={Link}
          to={createRiverLink}
        />
        <ExoText
          styleName="Body Small 1"
          color="var(--exo-color-font-secondary)"
        >
          Learn how to build and scale your data flows with our{' '}
          <RiveryButton
            p={0}
            label="guided walkthrough"
            variant="link"
            as={Link}
            to={generatePath(AppRoutes.ONBOARDING, { env, account })}
            mb={0.5}
          />
        </ExoText>
      </Flex>
    </Center>
  );
}
