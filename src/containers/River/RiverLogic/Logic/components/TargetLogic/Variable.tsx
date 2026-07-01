import { ILogicStep } from 'api/types';
import { Box, VariablesIcon } from 'components';
import { TargetIcon } from 'containers/River/RiverLogic/Logic/components/TargetLogic/TargetLogic';
import React from 'react';
import { getHashKey } from 'utils/api.sanitizer';
import { Collapse, DisplayVariantProps } from '../Collapse';
import { VariableCreator } from '../VariableCreator/VariableCreator';

interface Props extends DisplayVariantProps {
  node: ILogicStep;
}

export function Variable({
  node: { content },
  node,
  displayVariant = Collapse.DisplayVariant.DEFAULT,
}: Props) {
  const hash = getHashKey(node);
  const { variable_name: varName, is_global_variable: isGlobalVariable } =
    content;

  if (displayVariant === Collapse.DisplayVariant.SUMMARY) {
    return (
      <>
        <TargetIcon icon={VariablesIcon} boxSize={5} />
        <span>Variable Name: {varName}</span>
      </>
    );
  }
  return (
    <Box pl={1} mt={3}>
      <VariableCreator
        hash={hash}
        varName={varName}
        isGlobal={isGlobalVariable}
      />
    </Box>
  );
}
