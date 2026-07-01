import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Box,
  Grid,
  Icon,
} from '@chakra-ui/react';
import { CheckmarkSolid, OutlinedSuccess } from 'components';
import { useUpdateUserOnboardingMutation } from 'containers/Settings/Users/usersV1.query';
import React, { useCallback } from 'react';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';
import { useOnboardingStepsProgress } from '../helpers';
import { Step } from './Step';
import { ONBOARDING_STEPS } from './Steps/StepsStaticContent';

export function OnboardingSteps({ onboarding }) {
  const [update] = useUpdateUserOnboardingMutation();
  const { selectedAccountId, userId } = useCore();
  const { isAdminRole } = useCore();
  const steps = onboarding && Object.values(onboarding);
  const completionCriteria = useOnboardingStepsProgress(onboarding);
  const updateStep = useCallback(
    (step, substep) => {
      const currentStepState = onboarding?.[step];
      const substepCompleted = currentStepState?.[substep];
      if (Boolean(substepCompleted)) {
        return;
      }
      update({
        account_id: selectedAccountId,
        user_id: getOId(userId),
        step: { step_key: step, substep_key: substep },
      });
    },
    [onboarding, selectedAccountId, update, userId],
  );
  return (
    <Accordion
      allowToggle
      sx={{
        '& .chakra-accordion__item:last-child': {
          borderBottomWidth: 0,
        },
      }}
    >
      <Grid gap={4}>
        {Object.values(ONBOARDING_STEPS).map(({ title }, idx) =>
          !isAdminRole && title.includes('Invite') ? null : (
            <AccordionItem
              key={idx}
              borderRadius={4}
              boxShadow="md"
              sx={{
                '&:has(>[aria-expanded="true"])': {
                  border: '2px solid',
                  borderBottomWidth: '2px!important',
                  borderColor: 'var(--chakra-colors-purple-300)',
                },
              }}
            >
              <AccordionButton
                h="50px"
                py={4}
                px={6}
                border="1px solid"
                borderColor="transparent"
                color="font"
                sx={{
                  '&[aria-expanded="false"]': {
                    '&:hover': {
                      bg: 'gray.200',
                      borderColor: 'border-contrast',
                      borderRadius: 4,
                    },
                  },
                  '&[aria-expanded="true"]': {
                    borderBottom: '1px solid',
                    borderBottomColor: 'border-contrast',
                    color: 'primary',
                    fontWeight: 'medium',
                    bg: 'background-secondary',
                  },
                }}
              >
                <Icon
                  color={
                    completionCriteria?.[idx]
                      ? 'success'
                      : 'background-deselected'
                  }
                  as={
                    completionCriteria?.[idx] ? CheckmarkSolid : OutlinedSuccess
                  }
                  boxSize={5}
                  mr={3}
                />
                <Box as="span" flex="1" textAlign="left">
                  {title}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <Step
                stepIndex={idx + 1}
                step={steps?.[idx]}
                onUpdateStep={updateStep}
              />
            </AccordionItem>
          ),
        )}
      </Grid>
    </Accordion>
  );
}
