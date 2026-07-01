import {
  ComponentsTypes,
  SelectedTargetResolver,
} from 'containers/River/Targets/SelectedTarget';
import { Dataframe } from 'modules/DataFrames';
import React from 'react';
import { Collapse } from './Collapse';
import { useStepContentForm } from './hooks/useStepContentForm';

export function DataframeResolver({
  node,
  displayVariant = Collapse.DisplayVariant.DEFAULT,
  ...rest
}) {
  const {
    content,
    content: { block_type: blockType },
  } = node;
  const { onSubmitHandler, useFormApi } = useStepContentForm(node);

  return (
    <>
      <Dataframe node={node} displayVariant={displayVariant} {...rest} />
      {displayVariant === Collapse.DisplayVariant.DEFAULT ? (
        /*more settings for dataframe for a specific target*/
        <SelectedTargetResolver
          component={ComponentsTypes.LOGIC_DATAFRAME}
          targetType={blockType}
          onSubmitHandler={onSubmitHandler}
          useFormApi={useFormApi}
          content={content}
          step={node}
          displayVariant={displayVariant}
        />
      ) : null}
    </>
  );
}
