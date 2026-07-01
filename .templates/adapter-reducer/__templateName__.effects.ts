import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'api';
import { REDUCER_KEY } from './__templateName__.types';

const createType = (action: string) => `${REDUCER_KEY}/${action}`;

export const fetch__templateNameToPascalCase__ = createAsyncThunk(
  createType('fetch__templateNameToPascalCase__'),
  async () => {
    try {
      const response = await API;
      return response;
    } catch (error) {
      return error;
    }
  },
);
