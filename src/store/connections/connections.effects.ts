import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'api';
import { REDUCER_KEY } from './connections.types';

const createType = (action: string) => `${REDUCER_KEY}/${action}`;

export const fetchConnections = createAsyncThunk(
  createType('fetchConnections'),
  async () => {
    try {
      const response = await API.connections.list();
      return response;
    } catch (error) {
      return error;
    }
  },
);
