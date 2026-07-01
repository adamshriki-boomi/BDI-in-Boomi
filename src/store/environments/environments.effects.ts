import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'api';
import { AddVariableConfig } from 'api/endpoints/environments.api';
import { REDUCER_KEY } from './environments.types';

const createType = (action: string) => `${REDUCER_KEY}/${action}`;

export const addVariableToEnvironment = createAsyncThunk(
  createType('addVariableToEnvironment'),
  async (params: AddVariableConfig) => {
    try {
      const response = await API.environments.addVariable(params);
      return response;
    } catch (error) {
      throw error;
    }
  },
);

export const updateVariableValue = createAsyncThunk(
  createType('updateVariable'),
  async (params: {
    variable: string;
    variable_value: string;
    env_id: string;
  }) => {
    try {
      const response = await API.environments.updateVariable(params);
      return response;
    } catch (error) {
      throw error;
    }
  },
);

export const addVariableToSelectedEnvironments = createAsyncThunk(
  createType('addVariableToEnvironment'),
  async (params: { variable_name: string; values: Record<string, string> }) => {
    try {
      const response = await API.environments.addVariableToSelectedEnvironments(
        params,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
);

export const deleteVariable = createAsyncThunk(
  createType('deleteVariable'),
  async (params: { environments: string[]; variable_name: string }) => {
    try {
      const response = await API.environments.deleteVariable(params);
      return response;
    } catch (error) {
      throw error;
    }
  },
);
