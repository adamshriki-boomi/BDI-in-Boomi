import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  RiverTypes,
  Run,
  StepsStatusLog,
  StepTypes,
  TargetTypes,
  Variable,
} from 'api/types';
import { AppRoutes } from 'app/routes';
import { IRiverActivityRun } from 'containers/Activities';
import { getNewStepName } from 'containers/River/RiverLogic/Logic/utils/logic.utils';
import { generatePath, matchPath } from 'react-router-dom';
import { createRiverId } from 'utils/api.sanitizer';
import {
  fetchRiver,
  fetchRiverVariables,
  getRiverForVariables,
  reloadRiver,
  restoreRiver,
  runRiver,
  runRiverV1,
  saveRiver,
} from './river.effects';
import { adapter } from './river.selectors';
import { IRiverState, NodeType, REDUCER_KEY } from './river.types';
import {
  clearBackup,
  clearErrors,
  onRestoreRiver,
  resetRunStatus,
  selectRiver,
  setErrorFailRiver,
  setInitialVariables,
  setIsRiverVariablesLoaded,
  setRunPending,
  setSelectedVariables,
  setSelectRiverIsDirty,
  updateErrors,
  updateRiver,
  updateRiverWithoutReload,
  upsertRiver,
} from './state.mutations';
import { createRiverDraftByType } from './utils/river.builder';
import {
  deleteStepByHash,
  getSelected,
  getStep,
  getSteps,
  guardRiverMutation,
  moveStep,
  moveStepByTargetHash,
  moveStepToContainer,
  setStepProps,
  updateRiverDefinitions,
  updateRiverTaskConfig,
  updateRiverTaskDefinitions,
  updateStep,
  updateStepContent,
} from './utils/river.mutations';
import { addLogicStep } from './utils/steps.builder';
import { versionActions } from './version.actions';

export const initialState: IRiverState = {
  selectedId: '',
  selectedVariables: {},
  initialVariables: {},
  isRiverVariablesLoaded: false,
  selectedRiverIsDirty: false,
  ids: [],
  entities: {},
  runDetails: {},
  runStepsStatus: {},
  versions: {
    display: false,
    latestRiver: null,
  },
  errors: {},
  isReloading: false,
  waitingRun: false,
  isPending: false,
  riverSchedulerAndNotifications: {
    scheduling: null,
    settings: {
      notification: {
        on_failure: null,
        on_warning: null,
        on_run_threshold: null,
      },
      run_timeout_seconds: null,
    },
  },
  riverMetadata: {
    created_by: '',
    created_at: '',
    last_updated_by: '',
    last_updated_at: '',
    description: '',
    name: '',
    group_id: '',
    group_name: '',
    river_status: 'disabled',
  },
};
export const slice = createSlice({
  name: REDUCER_KEY,
  initialState: adapter.getInitialState<IRiverState>(initialState),
  reducers: {
    clear(state) {
      setErrorFailRiver(state, null);
      Object.assign(state, initialState);
    },
    selectRiver(state, action: PayloadAction<string>) {
      selectRiver(state, action.payload);
      setSelectRiverIsDirty(state, false);
      resetRunStatus(state);
      clearBackup(state);
      clearErrors(state);
    },
    updateErrors(state, action: PayloadAction<any>) {
      updateErrors(state, action.payload);
    },
    ...versionActions,
    /**
     * creates a river locally
     */
    setDraftRiver(
      state,
      {
        payload,
      }: PayloadAction<{
        fields: Record<string, any>;
        type: RiverTypes;
        groupId: string;
        userMainTarget: TargetTypes;
        isNewLogicAsV2: boolean;
      }>,
    ) {
      const { type, groupId, userMainTarget, fields, isNewLogicAsV2 } = payload;
      upsertRiver(
        state,
        createRiverDraftByType(
          type,
          groupId,
          userMainTarget,
          fields,
          isNewLogicAsV2,
        ),
      );
      setSelectedVariables(state, {});
    },
    // MUTATIONS ON A SELECTED RIVER
    updateRiverDefinitions: guardRiverMutation(updateRiverDefinitions),
    updateRiverTaskDefinitions: updateRiverTaskDefinitions,
    updateRiverTaskConfig: updateRiverTaskConfig,
    updateSchedulerAndNotifications: updateSchedulerAndNotifications,
    addLogicStep: guardRiverMutation(
      (
        state,
        action: PayloadAction<
          | {
              userMainTarget?: StepTypes;
              stepIndex?: number;
              defaultFields?: any;
            }
          | undefined
        >,
      ) => {
        const draftSteps = getSteps(state);
        addLogicStep({
          stepType: action.payload?.userMainTarget,
          steps: draftSteps,
          stepIndex: action.payload?.stepIndex,
          defaultFields: action.payload?.defaultFields,
        });
      },
    ),
    moveStepByTargetHash(
      state,
      action: PayloadAction<{
        sourceId: string;
        targetId: string;
        mode?: string;
      }>,
    ) {
      moveStepByTargetHash(state, action);
    },
    moveStep(
      state,
      action: PayloadAction<{
        sourceId: string;
        direction: number;
        outside?: boolean;
        toEdge?: boolean;
      }>,
    ) {
      moveStep(state, action);
    },
    removeStep: guardRiverMutation(deleteStepByHash),
    addLogicStepToContainer: guardRiverMutation(
      (
        state,
        action: PayloadAction<{ containerHashKey: string; stepIndex: number }>,
      ) => {
        const container = getStep(state, action.payload.containerHashKey);
        // const stepType = action.payload !== 'target_email'
        addLogicStep({
          steps: container.nodes,
          stepIndex: action.payload.stepIndex,
          name: getNewStepName(getSteps(state), NodeType.STEP),
        });
      },
    ),
    addVariable: guardRiverMutation(
      (
        state,
        action: PayloadAction<{
          name: string;
          isMulti?: boolean;
        }>,
      ) => {
        if (action.payload) {
          setSelectedVariables(state, {
            ...state.selectedVariables,
            [action.payload.name]: {
              clear_value_on_start: true,
              is_multi_value: action.payload.isMulti || false,
              value: '',
            },
          });
        }
      },
    ),
    setVariables: guardRiverMutation(
      (state, action: PayloadAction<Record<string, Variable>>) => {
        if (action.payload) {
          setSelectedVariables(state, action.payload);
        }
      },
    ),
    syncInitialVariables(state) {
      setInitialVariables(state, state.selectedVariables);
    },
    setGroup: guardRiverMutation((state, action: PayloadAction<string>) => {
      getSelected(state).river_definitions.group_id = createRiverId(
        action.payload,
      );
    }),
    /**
     * updates a step[hash] with prop: any
     */
    setStepProps: guardRiverMutation(setStepProps),
    /**
     * updates a steps[hash].content
     */
    updateStepContent: guardRiverMutation(updateStepContent),
    updateStep: guardRiverMutation(updateStep),
    /**
     * move steps[hash] to a container
     */
    moveStepToContainer: guardRiverMutation(moveStepToContainer),
    ///////////////////////
    // RIVER RUN ACTIONS //
    ///////////////////////
    setRunDetails(state, action: PayloadAction<Omit<Run, 'additional_data'>>) {
      state.runDetails = action.payload;
    },
    setNewRunDetails(state, action: PayloadAction<IRiverActivityRun>) {
      state.runDetails = action.payload;
    },
    setWaitingRun(state, action: PayloadAction<boolean>) {
      state.waitingRun = action.payload;
    },
    setRunStepsStatus(state, action: PayloadAction<StepsStatusLog[]>) {
      action.payload.forEach(log => {
        state.runStepsStatus[log.step_index] = log;
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(reloadRiver.pending, (state, action) => {
        state.isReloading = true;
        setErrorFailRiver(state, null);
      })
      .addCase(fetchRiver.pending, (state, action) =>
        setIsProcessing(state, true),
      )
      .addCase(fetchRiver.fulfilled, (state, action) => {
        setIsRiverVariablesLoaded(state, false);
        setErrorFailRiver(state, null);
        updateRiver(state, action);

        const riverType = action?.payload?.river_definitions?.river_type;
        if (
          [RiverTypes.SOURCE_TO_TARGET, RiverTypes.SOURCE_TO_FZ].some(
            value => value === riverType,
          )
        ) {
          const scheduling = action.payload.river_definitions.schedulers;
          const notification =
            action.payload.river_definitions.shared_params.notifications;
          const run_timeout_seconds =
            action.payload.river_definitions.shared_params
              .run_notification_timeout;

          updateSchedulerAndNotifications(state, {
            payload: {
              scheduling,
              settings: {
                notification,
                run_timeout_seconds,
              },
            },
          });
          const riverVariables =
            action?.payload?.river_definitions?.shared_params?.river_variables;
          setSelectedVariables(state, riverVariables);
          setInitialVariables(state, riverVariables);
        }

        if (RiverTypes.LOGIC !== riverType || state.isRiverVariablesLoaded) {
          //logic river will finish his loading when fetchRiverVariables.fulfilled
          setIsProcessing(state, false);
        }
      })
      .addCase(getRiverForVariables.fulfilled, (state, action) => {
        updateRiverWithoutReload(state, action);
      })
      .addCase(fetchRiverVariables.fulfilled, (state, action) => {
        const variables = action?.payload?.reduce(
          (a, v) => ({
            ...a,
            [v?.name]: getValue(v),
          }),
          {},
        );
        setSelectedVariables(state, variables);
        setInitialVariables(state, variables);
        setIsRiverVariablesLoaded(state, true);
        if (state.selectedId) {
          setIsProcessing(state, false);
        }
      })
      .addCase(fetchRiverVariables.rejected, (state, action) => {
        if (state.selectedId) {
          setIsProcessing(state, false);
        }
        setErrorFailRiver(state, action?.error?.message);
      })
      .addCase(fetchRiver.rejected, (state, action) => {
        const isLegacyRiver = Boolean(isMatchLegacy());
        if (isLegacyRiver) {
          redirectToReact();
        }
        setIsProcessing(state, false);
      })
      .addCase(saveRiver.fulfilled, (state, action) => {
        setSelectRiverIsDirty(state, false);
        updateRiver(state, action);
      })
      .addCase(runRiver.pending, state => {
        resetRunStatus(state);
        setRunPending(state, true);
      })
      .addCase(runRiverV1.pending, state => {
        resetRunStatus(state);
        setRunPending(state, true);
      })
      .addCase(runRiver.fulfilled, state => {
        setRunPending(state, false);
      })
      .addCase(runRiverV1.fulfilled, state => {
        setRunPending(state, false);
      })
      .addCase(restoreRiver.fulfilled, onRestoreRiver);
  },
});

function setIsProcessing(state, isProcessing = true) {
  state.isProcessing = isProcessing;
  if (!isProcessing) {
    state.isReloading = false;
  }
}

function isMatchLegacy() {
  const match: any = matchPath(window.location.pathname, {
    path: '/river/:account/:env/river/:river',
    exact: true,
    strict: true,
  });
  return match?.params;
}

function redirectToReact() {
  const params = isMatchLegacy();
  const path = generatePath(AppRoutes.RIVER, {
    env: params?.env,
    account: params?.account,
    river: params?.river,
  });
  return window.location.replace(path);
}

const getValue = v => {
  return {
    value:
      v.settings.is_multi_value && typeof v.value !== 'string'
        ? `["${v.value.join('","')}"]`
        : v.value,
    ...v.settings,
  };
};

function updateSchedulerAndNotifications(state, action) {
  state.riverSchedulerAndNotifications = action.payload;
}
