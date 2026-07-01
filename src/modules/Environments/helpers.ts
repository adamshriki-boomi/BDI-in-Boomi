import { useTheme } from '@chakra-ui/react';
import { useToastComponent } from 'hooks/useToast';
import { useCallback, useEffect } from 'react';
import { getOId } from 'utils/api.sanitizer';
import { envNameValidation } from 'utils/validations';
import {
  useAddEnvironmentMutation,
  useDeleteEnvironmentMutation,
  useEditEnvironmentMutation,
  useGetEnvironmentsQuery,
} from './environments.query';

export const useChakraTokenColor = color => {
  const {
    colors: baseColors,
    semanticTokens: { colors },
  } = useTheme();
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  const isBaseColor = color?.split('.').length > 1;
  const hex = isBaseColor
    ? baseColors[color?.split('.')[0]][color?.split('.')[1]]
    : exoTheme
    ? colors?.[color]?.background
    : colors?.[color]?.default;
  return hex;
};

export const useOpacityCalculate = (color, opacity) => {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  const tokenHex = useChakraTokenColor(color);
  const hex = tokenHex ? tokenHex : color;
  if (exoTheme) {
    if (color === 'yellow.200') {
      return 'lightCoral';
    }
    return hex;
  }
  const [r, g, b] = hex?.match(/\w\w/g).map(x => parseInt(x, 16));
  return `rgba(${r},${g},${b},${opacity})`;
};

export const normalizeVariableValue = value =>
  JSON.stringify(value).replace('"', '').replace('"', '');

const MAX_LENGTH = 60;
const useEnvironmentsNameValidator = () => {
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  return useCallback(
    (name: string, id: string) => {
      return Boolean(
        environmentsArray.find(
          ({ environment_name, cross_id }) =>
            environment_name === name && getOId(cross_id) !== id,
        ),
      );
    },
    [environmentsArray],
  );
};

export const useEnvironmentNameValidation = cross_id => {
  const nameExists = useEnvironmentsNameValidator();

  return useCallback(
    name =>
      (name?.length > MAX_LENGTH ? 'This Environment name too long.' : true) &&
      (nameExists(name, getOId(cross_id))
        ? 'This Environment name is already in use. Consider a different one.'
        : true) &&
      (name.match(envNameValidation)
        ? true
        : 'Environment name can only contain A-Za-z0-9_ - characters'),
    [cross_id, nameExists],
  );
};

export const useAddEnvironment = () => {
  const { success, error } = useToastComponent();
  const [addEnvironment, { error: message, isError, isSuccess, isLoading }] =
    useAddEnvironmentMutation();
  useEffect(() => {
    if (isSuccess) {
      success({ description: 'Environment added successfully' });
    }
    if (isError) {
      error({
        description:
          (message as any)?.data?.detail || 'Error adding environment',
      });
    }
  }, [isError, isSuccess, error, success, message]);
  return { addEnvironment, adding: isLoading };
};

export const useEditEnvironment = () => {
  const { success, error } = useToastComponent();
  const [editEnvironment, { error: message, isError, isSuccess, isLoading }] =
    useEditEnvironmentMutation();

  useEffect(() => {
    if (isSuccess) {
      success({ description: 'Environment modified successfully' });
    }
    if (isError) {
      error({
        description:
          (message as any)?.data?.detail || 'Error modifying environment',
      });
    }
  }, [isError, isSuccess, error, success, message]);
  return { editEnvironment, editing: isLoading };
};

export const useDeleteEnvironment = () => {
  const { success, error } = useToastComponent();
  const [deleteEnvironment, { error: message, isError, isSuccess, isLoading }] =
    useDeleteEnvironmentMutation();
  useEffect(() => {
    if (isSuccess) {
      success({ description: 'Environment deleted successfully' });
    }
    if (isError) {
      error({
        description:
          typeof message === 'string' ? message : 'Error deleting environment',
      });
    }
  }, [isError, isSuccess, error, success, message]);
  return { deleteEnvironment, deleting: isLoading };
};
