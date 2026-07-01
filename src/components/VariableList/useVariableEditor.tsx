import { API } from 'api';
import { IConnectionKeyPair } from 'api/types';
import { useEffect } from 'react';
import { useAsyncFn } from 'react-use';
import { getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';

export const useVariableEditor = (variable: string, connectionType: string) => {
  const [state, fetchVars] = useAsyncFn(async () => {
    return await API.connections.getKeyPairs(connectionType);
  });

  const [keyState, fetchKey] = useAsyncFn(
    async (variable: IConnectionKeyPair) => {
      const response = await API.connections.getKeyPair(getOId(variable._id));
      return response?.public_key;
    },
  );
  const selectedVariable = variable
    ? state?.value?.find(compare('key_file_name', variable))
    : null;

  useEffect(() => {
    fetchVars();
  }, [fetchVars]);

  useEffect(() => {
    if (selectedVariable) {
      fetchKey(selectedVariable);
    }
  }, [fetchKey, selectedVariable]);

  const createKeyPair = async (key_name: string) => {
    const response = await API.connections.createKeyPair({
      key_name,
      connectionType,
    });
    fetchVars();
    return response;
  };

  return {
    variables: state?.value || [],
    selectedVariable,
    loading: state?.loading,
    keyState,
    createKeyPair,
  };
};
