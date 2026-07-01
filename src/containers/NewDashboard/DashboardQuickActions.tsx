import { Box, Flex } from '@chakra-ui/react';
import { ExoText } from 'components/Exosphere/ExoText';
import { useCore } from 'store/core';
import { getDayPart } from 'utils/date.utils';
import { DashboardRiverCreationCards } from './DashboardRiverCreationCards';
import { ReactNode } from 'react';

function QuickActionsWrapper({
  username,
  description,
  children,
}: {
  username: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <Box
      bg="background"
      borderRadius="var(--exo-spacing-x-small, 8px)"
      border="1px solid"
      borderColor="border-secondary"
      padding="var(--exo-spacing-large, 24px)"
    >
      <Flex flexDirection="column" gap="var(---exo-spacing-medium, 20px)">
        <Flex flexDirection="column">
          <ExoText styleName="Subhead 1 Bold">
            Good {getDayPart()}, {username}
          </ExoText>
          <ExoText
            styleName="Body Small 1"
            color="var(--exo-color-font-secondary)"
          >
            {description}
          </ExoText>
        </Flex>
        {children}
      </Flex>
    </Box>
  );
}

export function DashboardQuickActions() {
  const { username, isViewerRole } = useCore();

  if (isViewerRole) {
    return (
      <QuickActionsWrapper
        username={username}
        description="Track performance and review recent activity"
      />
    );
  }

  return (
    <QuickActionsWrapper
      username={username}
      description="Track performance, review recent activity, and quickly create new Data Flows"
    >
      <DashboardRiverCreationCards />
    </QuickActionsWrapper>
  );
}
