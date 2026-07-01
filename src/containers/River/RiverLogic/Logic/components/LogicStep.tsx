import { Box, forwardRef, HStack, Icon, Text } from '@chakra-ui/react';
import {
  BlockTypes,
  ContainerRunningTypes,
  IDataTarget,
  ILogicStep,
  LogicTargetType,
  SourceType,
} from 'api/types';
import {
  Flex,
  GridBox,
  IconAddContainer,
  IconCondition,
  IconLoop,
  RiveryButton,
} from 'components';
import { SelectFormGroup } from 'components/Form';
import { Crown } from 'components/Icons/components';
import { Tagger } from 'components/Tracking/Tagger';
import { EnableFeatureModal } from 'containers/Login/components/EnableFeatureModal';
import { useStepUndo } from 'containers/River/RiverLogic/Logic/components/hooks/useStepUndo';
import {
  ComponentsTypes,
  SelectedTarget,
} from 'containers/River/Targets/SelectedTarget';
import { DataframeKey } from 'modules/DataFrames';
import { QualityTestRenderer, QualityTestsButton } from 'modules/QualityTests';
import { useCallback, useMemo } from 'react';
import { MdExpandMore } from 'react-icons/md';
import { useToggle } from 'react-use';
import { useAccount } from 'store/core';
import { useRiverActions } from 'store/river/hooks';
import { MAX_CONTAINERS_DEPTH } from 'store/river/utils/river.mutations';
import { getHashKey, getStepId } from 'utils/api.sanitizer';
import { compare, omitFromObject } from 'utils/array.utils';
import { isProdDomain } from 'utils/utils';
import { BlockAction } from './BlockAction';
import { BlockPython } from './BlockPython';
import { BlockRiver } from './BlockRiver';
import { BlockSqlScript } from './BlockSqlScript';
import { getConnectionDefaults } from './ConnectionBarLogic';
import { DataTargetSelect } from './DataTargetSelect/DataTargetSelect';
import { useStepActions } from './hooks/useStepActions';
import { useTitles } from './hooks/useTitles';
import RiveryDropdown from './RiveryChakraMenu';

type LogicStepProps = {
  node: ILogicStep;
  depth: number;
};

const StepTypeComponent = {
  [BlockTypes.SQL]: BlockSqlScript,
  [BlockTypes.ACTION]: BlockAction,
  [BlockTypes.RIVER]: BlockRiver,
  [BlockTypes.PYTHON]: BlockPython,
};

export function LogicStep({ node, depth }: LogicStepProps) {
  const StepComponent = node?.content?.block_primary_type
    ? StepTypeComponent?.[node?.content?.block_primary_type]
    : StepTypeComponent?.[node?.content?.block_type] ||
      StepTypeComponent?.[BlockTypes.SQL];
  return (
    <div>
      <StepsActionsBar node={node} depth={depth} />
      {StepComponent ? <StepComponent node={node} /> : null}
    </div>
  );
}

enum PremiumBlockTypes {
  PYTHON = 'allow_logic_python',
}

const upgradableBlockTypes = [PremiumBlockTypes.PYTHON];

function StepsActionsBar({ node, depth }: LogicStepProps) {
  const {
    content: {
      block_primary_type: blockPrimaryType,
      block_type: blockType,
      block_db_type: blockDBType,
    },
    step_name,
  } = node;
  const { isSettingOn } = useAccount();
  const showUpgradeBadge = upgradableBlockTypes.every(
    blockType => !isSettingOn(blockType),
  );
  const [showUpgradeModal, toggleUpgradeModal] = useToggle(false);
  const hash = getHashKey(node);
  const { moveToContainer } = useStepActions(hash);
  const showDataTargets =
    (!blockPrimaryType && ['river', 'action'].indexOf(blockType) < 0) ||
    blockPrimaryType === BlockTypes.SQL;

  const { setStepProps } = useRiverActions();
  const { target: currentTarget } = useTitles(blockType);
  const handleDataTargets = ({ logic_step_type: block_type }: IDataTarget) => {
    const fieldsToRemove =
      SelectedTarget[node.content.block_type]?.[ComponentsTypes.DEFAULT_FIELDS];
    const {
      [DataframeKey.SOURCE]: removeSource,
      [DataframeKey.TARGET]: removeTarget,
      execute_sql_command,
      ...restContent
    } = node.content;
    const fields = SelectedTarget[block_type]?.[ComponentsTypes.DEFAULT_FIELDS];
    //Getting the defaults of the *previous* target connection so they can be cleared
    const defaultValuesFromConnection = getConnectionDefaults(
      currentTarget?.target_type,
      {},
    );
    setStepProps({
      hash: getHashKey(node),
      content: {
        ...omitFromObject(restContent, fieldsToRemove),
        ...fields,
        //When changing target reset previously selected connection
        gConnection: null,
        //Reset connection defaults if there were any
        ...defaultValuesFromConnection,
        block_type,
        block_db_type: block_type,
        target_type: LogicTargetType.TABLE,
        source_type: SourceType.SQL_QUERY,
      },
    });
  };
  const { handleBlockTypeFn } = useStepUndo();
  const handleBlockType = useCallback(
    (oldStepType, newStep, content) =>
      handleBlockTypeFn({ oldStepType, newStep, content, hash, blockDBType }),
    [hash, blockDBType, handleBlockTypeFn],
  );

  const onBlockChange = useCallback(
    (oldStepType, newStep, content) => {
      if (showUpgradeBadge && newStep.value === BlockTypes.PYTHON) {
        toggleUpgradeModal(true);
        return;
      }
      handleBlockType(oldStepType, newStep, content);
    },
    [handleBlockType, showUpgradeBadge, toggleUpgradeModal],
  );
  const items = useMemo(
    () => [
      {
        value: 'Run Once',
        icon: <IconAddContainer />,
        onClick: () =>
          moveToContainer({
            containerRunning: ContainerRunningTypes.RUN_ONCE,
          }),
      },
      {
        value: 'Loop',
        icon: <IconLoop />,
        onClick: () =>
          moveToContainer({
            containerRunning: ContainerRunningTypes.LOOP_OVER,
          }),
      },
      {
        value: 'Condition',
        icon: <IconCondition />,
        onClick: () =>
          moveToContainer({
            containerRunning: ContainerRunningTypes.CONDITION,
          }),
      },
    ],
    [moveToContainer],
  );

  const displayQualityTests = !isProdDomain();
  return (
    <GridBox
      px={2}
      pt={2}
      justifyContent="space-between"
      alignItems="start"
      gridTemplateColumns={'320px max-content'}
    >
      <Box>
        <BlockTypeSelect
          blockType={blockType}
          blockPrimaryType={blockPrimaryType}
          stepId={step_name.replace(/\s+/g, '-')}
          onChange={(v1, v2) => onBlockChange(v1, v2, node.content)}
          showUpgradeBadge={showUpgradeBadge}
        />
        {showDataTargets ? (
          <DataTargetSelect
            controlId={step_name.replace(/\s+/g, '-')}
            onChange={handleDataTargets}
            value={blockType}
          />
        ) : null}
      </Box>
      {depth < MAX_CONTAINERS_DEPTH ? (
        <HStack mt={2} flexGrow={1} justifyContent="flex-end" gap={2}>
          {displayQualityTests && (
            <QualityTestRenderer blockType={blockPrimaryType}>
              <QualityTestsButton
                id={hash}
                stepId={getStepId(node)}
                value={node?.data_quality_tests_ids}
                ariaLabel={step_name}
              />
            </QualityTestRenderer>
          )}
          <RiveryDropdown
            isLazy
            placement="bottom"
            customMenuButton={AddContainerButton}
            menuItems={items}
            menuButtonAriaLabel={`${step_name} add container`}
            id={`${step_name} add container`}
          />
        </HStack>
      ) : null}
      <EnableFeatureModal
        feature="python"
        show={showUpgradeModal}
        toggle={toggleUpgradeModal}
      />
    </GridBox>
  );
}

const AddContainerButton = forwardRef((props, ref) => {
  return (
    <Box
      ref={ref}
      role="button"
      {...props}
      borderBottom="1px solid"
      borderBottomColor="gray.300"
      borderRadius="0"
      _hover={{
        borderRadius: '0 !important',
      }}
      p="0"
      h="29px"
      label="Add Container"
      display="flex"
      alignItems="center"
    >
      <IconAddContainer />
      <Text>Add Container</Text>
      <MdExpandMore />
    </Box>
  );
});

const useBlockTypes = (
  blockPrimaryType,
  blockType: BlockTypes,
  showUpgradeBadge: boolean,
) => {
  const filteredTypes = blockTypeItems(showUpgradeBadge);
  const selectedBlockType =
    filteredTypes.find(compare('value', blockPrimaryType)) ||
    filteredTypes.find(compare('value', blockType)) ||
    filteredTypes.find(compare('value', BlockTypes.SQL));
  return {
    list: filteredTypes,
    selected: selectedBlockType,
  };
};
function Option({ children, value }) {
  return (
    <Tagger tags={[{ 'logic-step-type': value }]}>
      <Box w="full">{children}</Box>
    </Tagger>
  );
}

const BlockTypeSelect = ({
  blockPrimaryType,
  blockType,
  stepId,
  onChange,
  showUpgradeBadge,
}) => {
  const { list, selected } = useBlockTypes(
    blockPrimaryType,
    blockType,
    showUpgradeBadge,
  );
  return (
    <SelectFormGroup
      options={list}
      controlId={`block-type-${stepId}`}
      onChange={val => onChange(selected, val)}
      value={selected}
      components={{ Option } as any}
    />
  );
};

const blockTypeItems = showUpgradeBadge => {
  return [
    {
      label: 'SQL / DB Transformations',
      value: BlockTypes.SQL,
      execute_sql_command: false,
    },
    {
      label: 'Data Flow',
      value: BlockTypes.RIVER,
      block_type: BlockTypes.RIVER,
    },
    {
      label: 'Action',
      value: BlockTypes.ACTION,
      block_type: BlockTypes.ACTION,
    },
    {
      label: (
        <Flex justifyContent="space-between">
          Python
          {showUpgradeBadge ? (
            <RiveryButton
              w="90px"
              size="small"
              label="Upgrade"
              leftIcon={
                <Icon as={Crown} color="data-solid-coral" boxSize={4} />
              }
            />
          ) : null}
        </Flex>
      ),
      value: BlockTypes.PYTHON,
      block_type: BlockTypes.LOGICODE,
      execute_sql_command: false,
      sql_query: null,
      code_type: BlockTypes.PYTHON,
      target_type: '',
    },
    // {
    //   label: 'Condition',
    //   value: 'condition',
    // },
  ];
};
