import { RiverTypes, StepTypes, TargetTypes } from 'api/types';
import { createStep } from './steps.builder';

export const DRAFT_UID = 'DRAFT';
export const isRiverDraft = (riverId: string) => riverId === DRAFT_UID;
export const createRiverDraftByType = (
  type: RiverTypes,
  groupId,
  userMainTarget,
  fields,
  isNewLogicAsV2: boolean,
) => {
  return RivertDrafts[type](groupId, userMainTarget, fields, isNewLogicAsV2);
};

function resolveDefaultStepType(userMainTarget: string) {
  return userMainTarget === TargetTypes.BIG_QUERY
    ? StepTypes.BIG_QUERY_SQL
    : userMainTarget;
}

export const createEmptyLogicRiver = (
  groupId: string,
  userMainTarget: string,
  fields: Record<string, any>,
  isNewLogicAsV2: boolean,
) => {
  return {
    cross_id: { $oid: DRAFT_UID },
    river_definitions: {
      shared_params: {
        notifications: {
          on_failure: { email: '{Mail_Alert_Group}' },
          on_warning: { email: '{Mail_Alert_Group}' },
          on_run_threshold: { email: '{Mail_Alert_Group}' },
        },
        fz_connection: {},
      },
      river_name: `Untitled Data Flow ${new Date().toLocaleString()}`,
      river_type: 'logic',
      group_id: { _id: { $oid: groupId } },
      ...(isNewLogicAsV2
        ? {
            is_api_v2: isNewLogicAsV2,
            schedulers: [{ is_enabled: false, cron_expression: '0 0/1 * * *' }],
          }
        : null),
    },
    tasks_definitions: [
      {
        task_label: 'logic',
        task_config: {
          logic_steps: [
            createStep(
              { step_name: 'Logic Step', ...fields },
              resolveDefaultStepType(userMainTarget),
            ),
          ],
          condition_name_counter: 0,
          step_name_counter: 1,
          variables: {},
          fz_batched: true,
          container_name_counter: 0,
          datasource_id: 'logic',
        },
        task_type_id: 'logic',
        ...(!isNewLogicAsV2
          ? {
              schedule: {
                endDate: {},
                isEnabled: false,
                sched: {
                  hour: 11,
                  min: 16,
                  showCrontab: false,
                  days: { days: 1 },
                  month: { radioMon: 0, months: 1, days: 1, month: 1 },
                  hours: { hours: 1, radioHour: 0 },
                  year: { radioYear: 0, days: 1 },
                  minutes: 15,
                },
                cronExp: '0 0 0/1 * * ? *',
              },
            }
          : null),
        connection_id: {},
        is_synchronized: true,
      },
    ],
    _id: { $oid: DRAFT_UID },
  };
};
export const createEmptyFZRiver = (
  connectionCrossId: string,
  dsId: string,
  connectionType: string,
) => ({
  river_definitions: {
    shared_params: {
      fz_connection: {},
      notifications: { on_failure: {}, on_warning: {} },
      target_type: 'snowflake',
    },
    river_type: 'src_to_fz',
  },
  tasks_definitions: [
    {
      task_type_id: 'src2fz',
      task_config: {
        fz_partition: 'd',
        source_format: 'NEWLINE_DELIMITED_JSON',
        extract_method: 'all',
        incremental_type: 'datetime',
        interval_time: 'dont_split',
        copied_files: 'remain_original',
        connection_type: connectionType,
        datasource_id: dsId,
      },
      is_synchronized: true,
      connection_id: { $oid: connectionCrossId },
    },
  ],
});
const RivertDrafts = {
  [RiverTypes.LOGIC]: createEmptyLogicRiver,
};
