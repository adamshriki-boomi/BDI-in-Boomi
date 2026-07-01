import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'api';
import { selectConnectionTypes } from './connectionTypes.selectors';
import { REDUCER_KEY } from './connectionTypes.types';

const createType = (action: string) => `${REDUCER_KEY}/${action}`;

export const fetchConnectionsByType = createAsyncThunk(
  createType('fetchConnectionsByType'),
  async (connectionType: string) => {
    try {
      const response = await API.connections.fetchConnectionByType(
        connectionType,
      );
      return response;
    } catch (error) {
      return error;
    }
  },
  {
    /**
     * make sure the same request(param) is not called again
     * caching - will continue to request only if:
     * - connectionType is different then the currently one
     * - there is a pending request
     */
    condition: (connectionType: string, { getState }) => {
      const connectionTypes = selectConnectionTypes(getState());
      const currentRequest = connectionTypes?.currentRequest;
      const isSameTypeRequest = currentRequest?.type === connectionType;
      return !isSameTypeRequest;
    },
  },
);
