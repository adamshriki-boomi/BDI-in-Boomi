import { Flex, GridItem } from '@chakra-ui/react';
import { RoutesBuilder } from 'app/routes';
import {
  Grid,
  RenderGuard,
  RiveryButton,
  RiveryButtonWithTooltip,
} from 'components';
import { useSttSource, useSttTarget } from 'modules/SourceTarget';
import React from 'react';
import { Link } from 'react-router-dom';
import { useCore } from 'store/core';
import { useRunComponentRenderer } from './RunControls';

interface WizardControlsProps {
  step?: number;
  onStepChange: (step: number) => any;
  isStepValid: boolean;
  validForSave?: any;
}

function useNextButtonTooltipContent(step: number) {
  const source = useSttSource();
  const target = useSttTarget();
  switch (step) {
    case 0: {
      return source?.name
        ? 'In order to proceed - fill all required fields'
        : 'In order to proceed - select a source';
    }
    case 1: {
      return target?.name
        ? 'In order to proceed - fill all required fields'
        : 'In order to proceed - select a target';
    }
    default:
      return null;
  }
}

export function WizardControls({
  step = 0,
  onStepChange,
  isStepValid,
  validForSave = false,
}: WizardControlsProps) {
  const runComponents = useRunComponentRenderer();
  const tooltipContent = useNextButtonTooltipContent(step);

  return (
    <Flex
      flexDir="column"
      className={`create-source-to-target-step-${step + 1}`}
    >
      <Grid
        gridTemplateAreas="'save . back next'"
        gridTemplateColumns="auto 1fr auto auto"
        gridGap="4"
        p="3"
        position="relative"
        borderTop="1px"
        borderTopColor="gray.300"
        maxH="57px"
      >
        <RenderGuard condition={step > 0}>
          <RiveryButton
            gridArea="back"
            variant="ghost"
            label="Back"
            size="sm"
            isDisabled={step === 0}
            onClick={() => onStepChange(step - 1)}
          />
        </RenderGuard>
        <ExitRiverCreationButton validForSave={validForSave} />
        {step === 3 ? (
          <GridItem gridArea="next">{runComponents.Button}</GridItem>
        ) : (
          <RiveryButtonWithTooltip
            label="Next"
            tooltip={tooltipContent}
            isDisabled={!isStepValid}
            onClick={() => onStepChange(step + 1)}
          />
        )}
      </Grid>
    </Flex>
  );
}

const ExitRiverCreationButton = ({ validForSave }) => {
  const { envId: env, selectedAccountId: account } = useCore();
  const props = { to: RoutesBuilder.rivers({ account, env }) };
  return (
    <RiveryButton
      gridArea="save"
      label={validForSave ? 'Save & Exit' : 'Exit'}
      variant="default"
      as={Link}
      {...props}
    />
  );
};
