import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'api';
import { REDUCER_KEY } from './groups.types';

const createType = (action: string) => `${REDUCER_KEY}/${action}`;

export const fetchGroups = createAsyncThunk(
  createType('fetchGroups'),
  API.groups.fetch,
);

export const updateGroup = createAsyncThunk(
  createType('updateGroup'),
  API.groups.update,
);

export const deleteOne = createAsyncThunk(
  createType('deleteOne'),
  API.groups.deleteOne,
);

export const createOne = createAsyncThunk(
  createType('createOne'),
  API.groups.create,
);
