import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'api';
import { createOId } from 'utils/api.sanitizer';
import { REDUCER_KEY } from './rivers.types';

const createType = (action: string) => `${REDUCER_KEY}/${action}`;

export const fetchRivers = createAsyncThunk(
  createType('fetchRivers'),
  async () => {
    try {
      const response = await API.rivers.list();
      return response;
    } catch (error) {
      throw error;
    }
  },
);

export const duplicateRiver = createAsyncThunk(
  createType('duplicateRiver'),
  async (id: string) => {
    try {
      const response = await API.rivers.copy({ _id: createOId(id) });
      return response;
    } catch (error) {
      throw error;
    }
  },
);
