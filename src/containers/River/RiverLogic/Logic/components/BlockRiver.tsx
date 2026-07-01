import { Box } from '@chakra-ui/react';
import { API } from 'api';
import { ILogicStep, IRiver } from 'api/types';
import {
  VariablesEditor,
  VariantVariables,
} from 'components/Form/VariablesEditor';
import { sourceToTargetTypes } from 'containers/Activities/[id]/components/RiverHeader';
import { Collapse } from 'containers/River/RiverLogic/Logic/components/Collapse';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useCore } from 'store/core/hooks';
import { useRiver } from 'store/river/hooks';
import { useRivers } from 'store/rivers/hooks';
import { useRiversActions } from 'store/rivers/hooks/useRiversActions';
import { getCrossId, getHashKey, getOId } from 'utils/api.sanitizer';
import { useStepActions } from './hooks/useStepActions';
import { RiverBar } from './RiverBar/RiverBar';

type BlockRiverProps = {
  node: ILogicStep;
};

export function BlockRiver({ node }: BlockRiverProps) {
  const {
    content: { river_id, input_variables: inputVariables },
  } = node;
  const hash = getHashKey(node);
  const { selectedAccountId: accountId, envId } = useCore();
  const { fetchRivers } = useRiversActions();

  const {
    selectedStepRiver,
    riversWithoutCurrentRiver,
    displayInputVariables,
  } = useStepRiverProps(river_id);

  const { updateContent } = useStepActions(hash);
  return (
    <Box px={2}>
      <RiverBar<IRiver>
        envId={envId}
        accountId={accountId}
        rivers={riversWithoutCurrentRiver}
        selectedRiver={selectedStepRiver}
        editInAnotherTab={true}
        onChange={({ cross_id }) => updateContent({ river_id: cross_id })}
        onRefresh={fetchRivers}
        nodeName={node.step_name}
      />
      {displayInputVariables ? (
        <InputVariables
          updateContent={updateContent}
          inputVariables={inputVariables}
          riverId={getOId(selectedStepRiver?.cross_id)}
        />
      ) : null}
    </Box>
  );
}
function useStepRiverProps(river_id) {
  const { riversArray } = useRivers();
  const isStepRiver = (river: IRiver) => getCrossId(river) === getOId(river_id);
  const { selectedRiverCrossId: currentRiver } = useRiver();

  const isCurrentRiver = (river: IRiver) =>
    getCrossId(river) === getOId(currentRiver);

  const selectedStepRiver = riversArray.find(isStepRiver);
  const isSourceToTarget = sourceToTargetTypes.some(
    type => type === selectedStepRiver?.river_definitions?.river_type_id,
  );

  const riversWithoutCurrentRiver = riversArray.filter(
    river => !isCurrentRiver(river),
  );
  const displayInputVariables = selectedStepRiver && isSourceToTarget;
  return {
    selectedStepRiver,
    displayInputVariables,
    riversWithoutCurrentRiver,
  };
}

const toRiverVariables = vars => {
  const changedVars = Object.values(vars)?.filter(
    (variable: any) => variable?.value?.length,
  );
  const toVariable = variable => {
    const { value, name } = variable;
    return [name, { value }];
  };
  return Object.fromEntries(changedVars.map(toVariable));
};

const InputVariables = ({ riverId, updateContent, inputVariables }) => {
  const { onChangeVariables, riverVariables, setVariables } = useGetVariables({
    updateContent,
  });
  return (
    <Collapse
      header="Input Variables"
      pb={4}
      onExpand={() => {
        if (riverId) {
          //Every time we open input variables we would like to refresh the variables list
          API.rivers.lisVariables(riverId)?.then(res => {
            setVariables(toVariablesStructure(res, inputVariables));
          });
        }
      }}
    >
      <VariablesEditor
        variant={VariantVariables.RIVER_INPUTS}
        onChange={onChangeVariables}
        variables={riverVariables}
      />
    </Collapse>
  );
};

const useGetVariables = ({ updateContent }) => {
  const [riverVariables, setVariables] = useState();

  const onChangeVariables = newVars => {
    setVariables(newVars);
  };

  useEffect(() => {
    if (riverVariables)
      updateContent({ input_variables: toRiverVariables(riverVariables) });
  }, [riverVariables, updateContent]);

  return { onChangeVariables, riverVariables, setVariables };
};

const toVariablesStructure = (variables, inputVariables = {}) => {
  const v = inputVariables
    ? Object.fromEntries(
        Object.entries(variables)
          ?.map(([key, value]) => {
            const { value: val, ...newVal } = value as any;
            const varName = (value as any)?.name;
            const varValue = (inputVariables as any)[varName]?.value;
            return [varName, { placeholder: val, value: varValue, ...newVal }];
          })
          ?.filter(variable => {
            return !Boolean((variable as any)[1]?.settings?.is_private);
          }),
      )
    : null;
  return v;
};
