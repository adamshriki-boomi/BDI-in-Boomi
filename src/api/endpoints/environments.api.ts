import { IEnvironment, OID } from 'api/types';
import { extractData, onDelete, patch, post, put } from '../api.proxy';

enum Endpoints {
  ENVIRONMENT_URL = '/environment',
  ENVIRONMENTS_URL = '/environments',
}

function extractErrorMessage(e) {
  return { message: e?.response?.data?.message, error: true };
}

export type AddVariableConfig = {
  env_id: string;
  variable_name: string;
  variable_value: string;
};

export const deleteVariable = ({ variable_name, environments }) => {
  return onDelete(
    `${Endpoints.ENVIRONMENTS_URL}/delete_variable?variable_name=${variable_name}`,
    { data: { environments } },
  ).then(extractData);
};

export const updateVariable = ({ variable_value, variable, env_id }) => {
  return patch(
    `${Endpoints.ENVIRONMENTS_URL}/update_variable?env_id=${env_id}`,
    {
      variable,
      variable_value,
    },
  );
};

export const addVariable = ({
  env_id,
  variable_name: variable,
  ...data
}: AddVariableConfig): Promise<IEnvironment> => {
  return post(
    `${Endpoints.ENVIRONMENTS_URL}/add_variable`,
    { variable, ...data },
    {
      params: { env_id },
    },
  ).then(extractData);
};

export const addVariableToSelectedEnvironments = ({
  variable_name,
  values,
}: {
  variable_name: string;
  values: Record<string, string>;
}) => {
  return put(`${Endpoints.ENVIRONMENTS_URL}/variables`, {
    variable_name,
    values,
  })
    .then(extractData)
    .catch(e => extractErrorMessage(e));
};

export type AddEnvironmentConfig = {
  environment_name: string;
  color: string;
  description?: string;
};

export type EditEnvironmentConfig = {
  cross_id: OID;
  environment_name?: string;
  color?: string;
  description?: string;
  is_default?: boolean;
};
