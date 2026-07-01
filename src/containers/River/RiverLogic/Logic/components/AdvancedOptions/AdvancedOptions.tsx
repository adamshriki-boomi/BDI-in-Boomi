import { ILogicStep } from 'api/types';
import { Box } from 'components';
import {
  ComponentsTypes,
  SelectedTargetResolver,
} from 'containers/River/Targets/SelectedTarget';
import * as React from 'react';
import { Collapse } from '../Collapse';
import { useStepContentForm } from '../hooks/useStepContentForm';

type AdvancedOptionsProps = {
  node: ILogicStep;
};

export function AdvancedOptions({ node }: AdvancedOptionsProps) {
  const { content, step_name } = node;
  const { onSubmitHandler, useFormApi } = useStepContentForm(node);

  return (
    <SelectedTargetResolver
      component={ComponentsTypes.ADVANCED_OPTIONS_LOGIC}
      targetType={content.block_type}
      content={content}
      useFormApi={useFormApi}
      stepName={step_name}
      wrapper={({ children }) => (
        <Collapse my={3} header="Advanced Options" label={step_name}>
          <Box as="form" onSubmit={onSubmitHandler} mt={2} px={2}>
            {children}
          </Box>
        </Collapse>
      )}
    />
  );
}
