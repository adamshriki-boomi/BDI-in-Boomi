import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'api';
import { REDUCER_KEY } from './riverTypes.types';

const createType = (action: string) => `${REDUCER_KEY}/${action}`;

export const fetchRiverTypes = createAsyncThunk(
  createType('fetchRiverTypes'),
  async (): Promise<any[]> => {
    const response = await API.rivers.riverTypes();
    return response.map(
      ({
        river_type_id: type,
        _id,
        properties: { desc, title, tooltip, icon_url },
      }) => ({
        desc,
        title,
        tooltip,
        icon_url,
        type,
        _id,
      }),
    );
  },
  {
    condition(_, { getState }): boolean {
      const riverTypesState = getState()[REDUCER_KEY];
      return !(riverTypesState.ids?.length || riverTypesState.loading);
    },
  },
);
