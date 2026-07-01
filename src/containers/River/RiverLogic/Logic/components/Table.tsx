import { ILogicStep } from 'api/types';
import { IconTable } from 'components/Icons';
import {
  ComponentsTypes,
  SelectedTargetPrefetch,
  SelectedTargetResolver,
} from 'containers/River/Targets/SelectedTarget';
import React from 'react';
import { Collapse, DisplayVariantProps } from './Collapse';
import { useStepContentForm } from './hooks/useStepContentForm';
import { TargetIcon } from './TargetLogic';
interface TableProps extends DisplayVariantProps {
  node: ILogicStep;
}
export function Table({
  node,
  displayVariant = Collapse.DisplayVariant.DEFAULT,
}: TableProps) {
  const {
    content,
    content: { block_type, target_table },
  } = node;
  const { onSubmitHandler, useFormApi } = useStepContentForm(node);
  if (displayVariant === Collapse.DisplayVariant.SUMMARY) {
    return (
      <>
        <TargetIcon icon={IconTable} boxSize={7} />
        {target_table ? <span>Table Name: {target_table}</span> : null}
        <SelectedTargetPrefetch targetType={block_type} step={node} />
      </>
    );
  }
  return (
    <SelectedTargetResolver
      component={ComponentsTypes.LOGIC_TABLE}
      targetType={block_type}
      onSubmitHandler={onSubmitHandler}
      useFormApi={useFormApi}
      content={content}
      step={node}
      displayVariant={displayVariant}
    />
  );
}
