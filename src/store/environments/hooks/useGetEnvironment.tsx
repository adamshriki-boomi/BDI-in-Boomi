import { useTheme } from '@chakra-ui/react';
import { useGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { useOpacityCalculate } from 'modules/Environments/helpers';
import { useMemo } from 'react';
import { useCore } from 'store/core';
import { compare } from 'utils/array.utils';

const unmappedColors = (colors: any) => ({
  'yellow.200': {
    icon: 'yellow.200',
    default: colors.lightCoral.default,
    hover: colors.lightCoral.hover,
  },
  'gray.400': {
    icon: 'gray.500',
    default: 'gray.200',
    hover: 'gray.300',
  },
});

export const useSelectedEnvironment = () => {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  const {
    semanticTokens: { colors },
  } = useTheme();
  const { data: environmentEntities } = useGetEnvironmentsQuery('');
  const { envId } = useCore();
  const selectedEnv = environmentEntities?.find(compare('_id', envId));
  const color = selectedEnv ? selectedEnv?.color : 'background-secondary';
  const name = selectedEnv?.environment_name;
  const hoverColor = useOpacityCalculate(color, 0.8);
  //The token of yellow.200 can't be removed because this is what we use in the colors enum
  const response = useMemo(() => {
    return {
      selectedEnv,
      name,
      color: exoTheme
        ? colors[color]?.background ?? unmappedColors(colors)[color]?.default
        : color,
      hoverColor: exoTheme
        ? colors[color]?.hover ?? unmappedColors(colors)[color]?.hover
        : hoverColor,
      iconColor: colors[color]?.default ?? unmappedColors(colors)[color]?.icon,
      environmentsLength: environmentEntities?.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envId, environmentEntities]);
  return response;
};

export const useEnvironmentsVariables = () => {
  const { data: environmentEntities } = useGetEnvironmentsQuery('');
  const allVariables = useMemo(
    () => [
      ...new Set(
        environmentEntities
          ?.map(({ variables }) => Object.keys(variables))
          ?.flat(1),
      ),
    ],
    [environmentEntities],
  );

  const accountVariables = useMemo(
    () =>
      allVariables.map(
        variable =>
          environmentEntities.reduce((acc, env) => {
            const { variables, environment_name, cross_id } = env;
            acc['name'] = variable;
            if (typeof variables[variable] == 'string') {
              if (acc['ids']) {
                acc['ids'].push(cross_id);
              } else {
                acc['ids'] = [cross_id];
              }
              return {
                ...acc,
                [environment_name]: {
                  value: variables[variable],
                  id: cross_id,
                },
              };
            }
            return acc;
          }, {}) as Record<string, string>,
      ),
    [allVariables, environmentEntities],
  );
  return accountVariables;
};
