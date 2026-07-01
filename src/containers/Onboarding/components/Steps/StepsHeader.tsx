import { Box, Progress } from '@chakra-ui/react';
import { Flex, Grid, Text } from 'components';
import { useOnboardingStepsProgress } from 'containers/Onboarding/helpers';
import React from 'react';
import { useCore } from 'store/core';

export function StepsHeader({ onboarding, resourceCenter = false }) {
  const { isAdminRole } = useCore();
  const progressStepsCount = useOnboardingStepsProgress(onboarding);
  const stepscount = isAdminRole ? 6 : 5;
  const completedMainSteps = progressStepsCount?.filter(completed => completed);
  const progress = completedMainSteps
    ? (completedMainSteps?.length / stepscount) * 100
    : 0;

  const allStepsCompleted = completedMainSteps?.length === stepscount;
  const stepsHeaderText = allStepsCompleted
    ? 'Woo Hoo! All Steps Completed!'
    : `${completedMainSteps ? completedMainSteps?.length : 0} ${
        resourceCenter ? 'Tasks' : 'Steps'
      } Completed`;
  return (
    <Flex flexDir="column" color="font" position="relative" gap={1}>
      <Grid
        alignItems="baseline"
        templateColumns={resourceCenter ? 'unset' : '1fr 5fr'}
      >
        {resourceCenter ? null : (
          <Text textStyle="M4" fontWeight="600" pr={2}>
            Let's Get Started
          </Text>
        )}
        <Box position="relative">
          <Text
            color={allStepsCompleted ? 'success' : 'font'}
            textStyle={resourceCenter ? 'R8' : 'M7'}
            position="absolute"
            bottom={2}
            right={0}
          >
            {stepsHeaderText}
          </Text>
          <Progress
            value={progress}
            borderRadius="15px"
            colorScheme="blue"
            size="sm"
            bg="gray.400"
            sx={{
              '& [role="progressbar"]': {
                bg: 'var(--chakra-colors-blue-500)',
              },
            }}
          />
        </Box>
      </Grid>
      {/* {resourceCenter ? null : (
        <Text textStyle="R7">
          Get the most out of Boomi Data Integration and become a Boomi Viking!
        </Text>
      )} */}
    </Flex>
  );
}
