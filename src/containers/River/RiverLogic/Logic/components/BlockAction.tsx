import { Box, Icon, IconButton, VStack } from '@chakra-ui/react';
import { useDroppable } from '@dnd-kit/core';
import { API } from 'api';
import { ILogicStep, IRiver } from 'api/types';
import {
  VariablesEditor,
  VariantVariables,
} from 'components/Form/VariablesEditor';
import { ArrowDown, PlusIcon, VerticalLine } from 'components/Icons';
import { Collapse } from 'containers/River/RiverLogic/Logic/components/Collapse';
import { stepMaxWidth } from 'containers/River/RiverLogic/Logic/components/TreeNode';
import { ConnectionBar, useStepPropValidationMessage } from 'modules';
import { useMemo } from 'react';
import { useAsync } from 'react-use';
import {
  useActionRivers,
  useActionRiversActions,
  useActionRiversLoader,
} from 'store/actionRivers';
import { useConnectionsByType } from 'store/connectionTypes';
import { useCore } from 'store/core';
import { useRiver, useRiverActions } from 'store/river';
import { getHashKey, getOId } from 'utils/api.sanitizer';
import { pluck } from 'utils/array.utils';
import './AddStepButton.scss';
import { useStepActions } from './hooks/useStepActions';
import { RiverBar } from './RiverBar/RiverBar';

type BlockActionProps = {
  node: ILogicStep;
};

export function BlockAction({ node }: BlockActionProps) {
  const { actionRiversArray } = useActionRivers();
  const { fetchActionRivers } = useActionRiversActions();
  useActionRiversLoader();
  const { selectedAccountId: accountId, envId } = useCore();
  const hash = getHashKey(node);
  const { updateContent } = useStepActions(hash);
  const selectedActionRiver = actionRiversArray.find(
    ({ cross_id }) => cross_id && getOId(cross_id) === node.content.action_id,
  );
  const { selectedVariables } = useRiver();
  const { addVariable } = useRiverActions();

  const { connections: customConnections } = useConnectionsByType('custom');

  const { value: actionParams } = useAsync(async () => {
    return (
      selectedActionRiver &&
      (await API.actions.listOne({
        _id: selectedActionRiver.cross_id,
        find_output_variables: true,
        include_is_secret: false,
      }))
    );
  }, [selectedActionRiver]);

  const connection_oid = node.content.connection_oid;

  const selectedConnection = useMemo(
    () =>
      customConnections?.find(
        ({ cross_id: { $oid } }) => $oid === connection_oid,
      ),
    [customConnections, connection_oid],
  );
  const { connection, action_variables, output_variables, interval_params } =
    actionParams?.original_variables ?? {};

  const nodeActionVariables = node?.content?.action_vars?.action_variables;
  const nodeIntervalParams = node?.content?.action_vars?.interval_params;

  const restType = {
    dataSourceId: 'rest',
    connectionType: 'custom',
    connectionHeader: 'Custom',
  };
  const editableVariables = useMemo(
    () =>
      toEditorActionVariables(
        action_variables,
        nodeActionVariables,
        interval_params,
        nodeIntervalParams,
      ),
    [
      action_variables,
      nodeActionVariables,
      interval_params,
      nodeIntervalParams,
    ],
  );

  const connectionValidationMessage = useStepPropValidationMessage(
    hash,
    'content.action_id',
  );

  return (
    <Box p={2}>
      <RiverBar<IRiver>
        envId={envId}
        accountId={accountId}
        rivers={actionRiversArray}
        selectedRiver={selectedActionRiver}
        onChange={({ cross_id: { $oid: action_id } }) =>
          updateContent({ action_id })
        }
        onRefresh={fetchActionRivers}
        nodeName={node.step_name}
        selectLabel="Select REST Action"
      />
      {connection?.cross_id ? (
        <ConnectionBar
          connections={customConnections}
          onChange={val =>
            updateContent({
              connection_oid: val?.cross_id ? getOId(val.cross_id) : '',
            })
          }
          displayListOnly={true}
          selectedConnection={selectedConnection}
          validationMessage={connectionValidationMessage}
          clearable
          {...restType}
        />
      ) : null}
      {editableVariables ? (
        <Collapse header="Input Variables">
          <VariablesEditor
            variant={VariantVariables.INPUTS}
            onChange={value =>
              updateContent(toContentActionVariables(value, interval_params))
            }
            variables={editableVariables}
          />
        </Collapse>
      ) : null}
      {output_variables?.length ? (
        <Collapse header="Output Variables">
          <VariablesEditor
            variant={VariantVariables.OUTPUTS}
            onMappingChange={(stepVar, riverVar) =>
              updateContent({
                output_vars_mapping: {
                  ...node.content?.output_vars_mapping,
                  [stepVar]: riverVar,
                },
              })
            }
            onAddOutputVariable={newVarName =>
              addVariable({ name: newVarName })
            }
            variables={Object.fromEntries(
              output_variables.map(value => [
                value,
                { value: node.content?.output_vars_mapping?.[value] },
              ]),
            )}
            outputVariables={selectedVariables}
          />
        </Collapse>
      ) : null}
    </Box>
  );
}

function toContentActionVariables(
  value: Record<string, any & { value: string }>,
  intervalParams: Record<string, any & { value: string }> | undefined,
) {
  // intervalKeys have to be separated to another sub key.
  const intervalKeys = intervalParams?.map(pluck('name')) ?? [];
  const valuesEntries = {
    action_variables: Object.entries(value)
      .filter(([_, { value }]) => value !== undefined)
      .filter(([key]) => !intervalKeys.includes(key))
      .map(([key, { value }]) => [key, value]),
    interval_params: Object.entries(value)
      .filter(([key]) => intervalKeys.includes(key))
      .filter(([_, { value }]) => value !== undefined)
      .map(([key, { value }]) => [key, value]),
  };

  return {
    action_vars: Object.fromEntries(
      Object.entries(valuesEntries)
        .filter(([_, entries]) => entries?.length)
        .map(([key, entries]) => [key, Object.fromEntries(entries)]),
    ),
  };
}

function toVariableEntry(values, type) {
  return function ({ name, value }) {
    return [name, { name, value: values?.[name], type, placeholder: value }];
  };
}

function toEditorActionVariables(
  actionVariables,
  stepVariables,
  intervalParams,
  stepIntervalParams,
) {
  if (!actionVariables?.length && !intervalParams?.length) {
    return;
  }
  return Object.fromEntries(
    (actionVariables ?? [])
      .map(toVariableEntry(stepVariables, 'Action'))
      .concat(
        (intervalParams ?? [])
          .map(({ value: { $date: value }, ...rest }) => ({
            ...rest,
            value,
          }))
          .map(toVariableEntry(stepIntervalParams, 'Interval Param')),
      ),
  );
}
export function DropZone({
  hashKey,
  embedded = false,
  alwaysOn = false,
  isParallel = false,
}) {
  const { setNodeRef, active, over } = useDroppable({
    id: hashKey,
  });
  const activeId = active?.id?.split('.')?.[0];
  const overId = over?.id;

  return useMemo(() => {
    if (!hashKey) {
      return null;
    }
    const dropZoneStyle =
      overId && overId !== activeId && overId === hashKey
        ? {
            background: 'dropzone',
            borderColor: 'dropzoneBorder',
            borderStyle: 'dashed',
            borderWidth: '3px',
            transform: 'translate(-50%, -50%)',
            height: '22px',
            top: '27px',
            left: '50%',
            right: '50%',
            marginTop: isParallel ? '180px' : 'unset',
          }
        : null;
    const styleProps = embedded
      ? {
          p: 2,
          m: 'auto',
          justifyContent: 'center',
        }
      : {
          p: 1,
          mx: 'auto',
          mb: 1,
        };
    return (
      <Box
        p={alwaysOn ? 3 : undefined}
        maxWidth={stepMaxWidth}
        position="absolute"
        w={isParallel ? '50%' : 'full'}
        {...styleProps}
        {...dropZoneStyle}
        ref={setNodeRef}
      />
    );
  }, [activeId, overId, hashKey, setNodeRef, embedded, isParallel, alwaysOn]);
}

export function AddStepButton({
  handleOnAddLogicStep,
  stepIndex,
  isLast,
  label = null,
  disabled,
  hashKey = undefined,
  ...rest
}) {
  const dropZone = useMemo(
    () => <DropZone hashKey={hashKey && `${hashKey}.after`} embedded />,
    [hashKey],
  );
  return (
    <Box position="relative" marginInline="auto">
      {dropZone}
      <VStack>
        <VerticalLine />
        <IconButton
          onClick={() => handleOnAddLogicStep(stepIndex)}
          icon={
            <Icon
              w={6}
              h={6}
              as={PlusIcon}
              _hover={{ transform: 'scale(1.2)' }}
            />
          }
          color="inherit"
          variant="ghost"
          border="1px solid"
          borderRadius={100}
          zIndex="base"
          aria-label={label}
          disabled={disabled}
          _focus={{ boxShadow: 'none' }}
          _active={{ boxShadow: 'none' }}
          mt="-6px !important"
          h={6}
          minW={6}
          {...rest}
        />
        {!isLast && <Icon as={ArrowDown} boxSize="4" m="0 !important" />}
      </VStack>
    </Box>
  );
}
