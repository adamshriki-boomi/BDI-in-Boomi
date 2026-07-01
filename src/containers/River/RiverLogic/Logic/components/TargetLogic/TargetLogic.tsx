import { Flex, Icon } from '@chakra-ui/react';
import { ILogicStep, LogicTargetType, SourceType } from 'api/types';
import { Box } from 'components';
import { RadioGroup } from 'components/Form';
import { DataframeResolver } from 'containers/River/RiverLogic/Logic/components/DataframeResolver';
import { SelectedTarget } from 'containers/River/Targets/SelectedTarget';
import { useTargetByBlockType } from 'modules/Datasources/useLogicTargets';
import React from 'react';
import { useAccount } from 'store/core';
import { useRiverActions } from 'store/river';
import { getHashKey } from 'utils/api.sanitizer';
import { Collapse, DisplayVariantProps } from '../Collapse';
import { FilesExport } from '../FilesExport';
import { Table } from '../Table';
import { Variable } from './Variable';

interface Props extends DisplayVariantProps {
  node: ILogicStep;
}

export function TargetLogic({
  node,
  displayVariant = Collapse.DisplayVariant.DEFAULT,
}: Props) {
  const { setStepProps } = useRiverActions();
  const { isSettingOn } = useAccount();

  const {
    content: { target_type, block_type },
    content,
    step_name,
  } = node;
  const hash = getHashKey(node);
  const onTargetChange = (value: string) => {
    setStepProps({
      hash,
      content: { ...content, target_type: value },
    });
  };
  const selectedDataTarget = useTargetByBlockType(content?.block_type);
  const isSourceDataFrame = content?.source_type === SourceType.DATAFRAME;

  const hasDataframes =
    isSettingOn('allow_logic_python') &&
    selectedDataTarget?.target_settings?.dataframe_as_target;

  const getTargets = selectedDataTarget => {
    return [
      {
        label: 'Table',
        value: LogicTargetType.TABLE,
        ariaLabel: 'Target Type Table',
        disabled:
          SelectedTarget[selectedDataTarget]?.LogicTargets?.Table === false,
      },
      {
        label: 'Variable',
        value: LogicTargetType.VARIABLE,
        ariaLabel: 'Target Type Variable',
        disabled:
          isSourceDataFrame ||
          SelectedTarget[selectedDataTarget]?.LogicTargets?.Variable === false,
      },
      hasDataframes && {
        label: 'DataFrame',
        value: LogicTargetType.DATAFRAME,
        ariaLabel: 'Target Type DataFrame',
        disabled:
          isSourceDataFrame ||
          SelectedTarget[selectedDataTarget]?.LogicTargets?.DATAFRAME === false,
      },
      {
        label: 'Files Export',
        value: LogicTargetType.FILES_EXPORT,
        ariaLabel: 'Target Type Files Export',
        disabled:
          isSourceDataFrame ||
          SelectedTarget[block_type]?.LogicTargets?.FileExport === false,
      },
    ].filter(Boolean);
  };
  const targetTypesControls = getTargets(selectedDataTarget);

  const target = (
    <TargetRenderer
      targetValue={target_type}
      node={node}
      displayVariant={displayVariant}
    />
  );

  if (displayVariant === Collapse.DisplayVariant.SUMMARY) {
    return target;
  }

  return (
    <Box p={3}>
      <RadioGroup
        values={targetTypesControls}
        checked={target_type}
        name="target_type"
        onChange={onTargetChange}
        aria-label={`Target Type ${step_name}`}
      />
      {target}
    </Box>
  );
}

const TargetComponents = {
  [LogicTargetType.TABLE]: Table,
  [LogicTargetType.VARIABLE]: Variable,
  [LogicTargetType.DATAFRAME]: DataframeResolver,
  [LogicTargetType.FILES_EXPORT]: FilesExport,
};

function TargetRenderer({
  node,
  targetValue,
  displayVariant = Collapse.DisplayVariant.DEFAULT,
}) {
  const Component = TargetComponents[targetValue] || null;
  return Component && <Component node={node} displayVariant={displayVariant} />;
}

export const TargetIcon = ({ icon, boxSize = 6 }) => (
  <Flex w={14} justifyContent="center">
    <Icon as={icon} boxSize={boxSize} />
  </Flex>
);
