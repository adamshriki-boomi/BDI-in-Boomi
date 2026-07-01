import { createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { IEnvironment } from 'api/types';
import { getCrossId, getOId } from 'utils/api.sanitizer';
import { AppState } from '../reducers';
import { IEnvironmentsState, REDUCER_KEY } from './environments.types';

export const adapter = createEntityAdapter<IEnvironment>({
  selectId: environment => getCrossId(environment),
});

export const selectors = adapter.getSelectors();

export const selectEnvironment = (state: AppState): IEnvironmentsState =>
  state[REDUCER_KEY];

export const selectEnvironmentsArray = createSelector(
  selectEnvironment,
  selectors.selectAll,
);

export const selectSelectedEnvId = createSelector(
  selectEnvironment,
  state => state.selectedEnvironment,
);
export const selectSelectedEnv = createSelector(
  selectEnvironment,
  selectSelectedEnvId,
  (state, selectedEnvId) => selectors.selectById(state, selectedEnvId),
);

export const selectSelectedEnvVariables = createSelector(
  selectSelectedEnv,
  env => env?.variables,
);

export const variablesFromEnvironments = createSelector(
  selectEnvironmentsArray,
  environments => {
    const allVariables = [
      ...new Set(
        environments
          .map(({ variables }) => Object.keys(variables ?? {}))
          .flat(1),
      ),
    ];

    return allVariables.map(
      variable =>
        environments.reduce((acc, env) => {
          const { variables, environment_name, cross_id } = env;
          acc['name'] = variable;
          if (variables && typeof variables[variable] == 'string') {
            if (acc['ids']) {
              acc['ids'].push(getOId(cross_id));
            } else {
              acc['ids'] = [getOId(cross_id)];
            }
            return {
              ...acc,
              [environment_name]: {
                value: variables[variable],
                id: getOId(cross_id),
              },
            };
          }
          return acc;
        }, {}) as Record<string, string>,
    );
  },
);

export const variableDrawerState = createSelector(
  selectEnvironment,
  state => state.variablesDrawer,
);
