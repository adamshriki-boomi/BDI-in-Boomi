import { createEmptyFZRiver } from '../utils';
import { useRiver } from './useRiver';

export enum CallType {
  CONNECTION = 'connection',
  CALL_FIELDS = 'call_fields',
  LOGIC = 'logic',
  SQL_RESULTS = 'sql_results',
}
function toCurrentStepConfig(task_config, current_step) {
  return { ...task_config, current_step, logic_steps: [] };
}

const callReducers = {
  [CallType.LOGIC]: (river, callFields, step) => {
    const { river_definitions, tasks_definitions } = river;
    return {
      river_definitions,
      tasks_definitions: [
        {
          ...tasks_definitions[0],
          task_config: toCurrentStepConfig(
            tasks_definitions[0].task_config,
            step,
          ),
        },
      ],
    };
  },
  [CallType.SQL_RESULTS]: (river, callFields, current_step) => {
    const { river_definitions, tasks_definitions } = river;
    return {
      river_definitions,
      tasks_definitions: [
        {
          ...tasks_definitions[0],
          task_config: toCurrentStepConfig(
            tasks_definitions[0].task_config,
            current_step,
          ),
        },
      ],
    };
  },
  [CallType.CONNECTION]: (river, callFields) => {
    const { connectionCrossId, dsId, connectionType } = callFields;
    const selectedRiver = createEmptyFZRiver(
      connectionCrossId,
      dsId,
      connectionType,
    );
    return selectedRiver;
  },
  [CallType.CALL_FIELDS]: (river, callFields) => {
    return callFields;
  },
};
export function useRiverForMetadataCall({
  callType = null,
  callFields = null,
  step = null,
}) {
  const river = useRiver()?.selected;
  return getRiverForMetadataCall(river, callType, callFields, step);
}

export function getRiverForMetadataCall(
  river,
  callType = null,
  callFields = null,
  step = null,
) {
  const reducer = callReducers?.[callType];
  return reducer ? reducer(river, callFields, step) : river;
}
