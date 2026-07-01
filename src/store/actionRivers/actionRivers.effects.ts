import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'api';
import { REDUCER_KEY } from './actionRivers.types';

const createType = (action: string) => `${REDUCER_KEY}/${action}`;

export const fetchActionRivers = createAsyncThunk(
  createType('fetchActionRivers'),
  async () => {
    try {
      const response = await API.rivers.listActionRivers();
      return response;
    } catch (error) {
      return error;
    }
  },
);
