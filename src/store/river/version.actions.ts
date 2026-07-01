import { PayloadAction } from '@reduxjs/toolkit';
import { IRiver } from 'api/types';
import { adapter } from './river.selectors';
import {
  clearBackup,
  getRiverCopy,
  setSelectedVariables,
  toggleRiverVersions,
  updateRiverBackup,
  upsertRiver,
} from './state.mutations';
import { getSelected } from './utils/river.mutations';

export const versionActions = {
  selectVersion(state, action: PayloadAction<Partial<IRiver>>) {
    const currentRiver = getSelected(state);
    const versionTaskDefintions = action.payload.tasks_definitions[0];
    const versionedRiver = {
      ...currentRiver,
      ...action.payload,
      tasks_definitions: [
        {
          ...versionTaskDefintions,
          task_config: {
            ...versionTaskDefintions?.task_config,
            logic_steps: [...versionTaskDefintions?.task_config.logic_steps],
            variables: versionTaskDefintions?.task_config.variables,
          },
        },
      ],
    };
    setSelectedVariables(state, versionTaskDefintions?.task_config.variables);
    toggleRiverVersions(state, true);
    if (!getRiverCopy(state)) {
      updateRiverBackup(state, currentRiver);
    }
    upsertRiver(state, versionedRiver);
  },
  toggleVersions(state, action: PayloadAction<boolean>) {
    toggleRiverVersions(state, action.payload);
  },
  restoreRiverBackup(state) {
    const riverBackup = getRiverCopy(state);
    if (riverBackup) {
      adapter.removeOne(state, state.selectedId);
      adapter.addOne(state, getRiverCopy(state));
      clearBackup(state);
      setSelectedVariables(
        state,
        riverBackup?.tasks_definitions[0]?.task_config.variables,
      );
    }
  },
  removeSelectedId(state) {
    adapter.removeOne(state, state.selectedId);
  },
};
