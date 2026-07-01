import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'api';
import { putDataV1 } from 'api/api.proxy';
import { IRiver } from 'api/types';
import { Variables } from 'store/rivers/types/river.types';
import { createRiverId, getCrossId } from 'utils/api.sanitizer';
import { selectInitialRiverVariables } from './river.selectors';
import { REDUCER_KEY } from './river.types';
import { isRiverDraft } from './utils';

const createType = (action: string) => `${REDUCER_KEY}/${action}`;

export const fetchRiver = createAsyncThunk(
  createType('fetchRiver'),
  async (riverId: string) => {
    try {
      return await API.rivers.listOne(createRiverId(riverId));
    } catch (error) {
      throw error;
    }
  },
);
export const getRiverForVariables = createAsyncThunk(
  createType('getRiverForVariables'),
  async (riverId: string) => {
    try {
      return await API.rivers.listOne(createRiverId(riverId));
    } catch (error) {
      throw error;
    }
  },
);

export const fetchRiverVariables = createAsyncThunk(
  createType('fetchRiverVariables'),
  async (riverId: string) => {
    try {
      return await API.rivers.lisVariables(riverId);
    } catch (error) {
      return Promise.reject(
        "Error: We couldn't get your data flow variables for some reason",
      );
    }
  },
);

export const reloadRiver = createAsyncThunk(
  createType('reloadRiver'),
  async (riverId: string, { dispatch }) => {
    return dispatch(fetchRiver(riverId));
  },
);

export const haveVariablesChanged = (
  initial: Record<string, any> | undefined,
  current: Record<string, any> | undefined,
): boolean => {
  return JSON.stringify(initial ?? {}) !== JSON.stringify(current ?? {});
};

export const moveToVariablesStructure = variables => {
  return {
    items: Object.keys(variables).flatMap(key => {
      return {
        name: key,
        value: variables[key].value,
        settings: {
          is_encrypted: variables[key].is_encrypted,
          clear_value_on_start: variables[key].clear_value_on_start,
          is_multi_value: variables[key].is_multi_value,
          is_private: variables[key].is_private,
        },
      };
    }),
  };
};

export const moveBPVariablesToVariablesStructure = (
  selectedVariables,
  variablesFromForm,
  encrypted,
) => {
  //In case for some reson the variables form the blueprint were not saved in store
  const varNames = selectedVariables && Object.keys(selectedVariables);
  return {
    items: Object.entries(variablesFromForm).flatMap(([key, value]) => {
      if (!varNames?.includes(key)) {
        return {
          name: key,
          value: variablesFromForm[key].value ?? value,
          settings: {
            is_encrypted:
              encrypted?.includes(`river.variables.${[key]}`) ??
              variablesFromForm[key].is_encrypted,
            clear_value_on_start: variablesFromForm[key].clear_value_on_start,
            is_multi_value: variablesFromForm[key].is_multi_value,
            is_private: variablesFromForm[key].is_private,
          },
        };
      }
      return null;
    }),
  };
};

export const saveRiver = createAsyncThunk(
  createType('saveRiver'),
  async (
    args: {
      modifiedRiver: IRiver;
      selectedVariables: Variables;
      updateUrl;
    },
    { getState },
  ) => {
    const { modifiedRiver, selectedVariables, updateUrl } = args;
    const crossId = getCrossId(modifiedRiver);
    const isDraft = isRiverDraft(crossId);
    const apiFunction = isDraft ? API.rivers.create : API.rivers.modify;
    return apiFunction(modifiedRiver)
      .catch(e => {
        return e.response;
      })
      .then(async result => {
        if (result?._id) {
          const initialVariables = selectInitialRiverVariables(
            getState() as any,
          );
          const variablesChanged = haveVariablesChanged(
            initialVariables,
            selectedVariables as any,
          );

          if (variablesChanged) {
            const vars = moveToVariablesStructure(selectedVariables || {});
            const resVariables: any = await putDataV1(
              true,
              `/rivers/${getCrossId(result)}/variables`,
              vars,
            );
            if (resVariables?.error) {
              if (isDraft) {
                updateUrl(getCrossId(result));
              }
              Promise.reject(
                "Error: We couldn't save your data flow variables for some reason",
              );
              return result;
            }
            if (resVariables?.detail) {
              if (isDraft) {
                updateUrl(getCrossId(result));
              }
              return Promise.reject(resVariables?.detail?.[0]?.msg);
            }
          }
          return result;
        } else {
          if (isDraft) {
            updateUrl(result.cro);
          }
          return Promise.reject(
            result?.msg || 'Something went wrong. Nothing was done.',
          );
        }
      });
  },
);

export const runRiver = createAsyncThunk(
  createType('runRiver'),
  API.rivers.run,
);

export const runRiverV1 = createAsyncThunk(
  createType('runRiverV1'),
  API.rivers.runV1,
);

export const restoreRiver = createAsyncThunk(
  createType('restoreRiver'),
  API.versions.restoreVersion,
);
