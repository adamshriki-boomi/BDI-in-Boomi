import { Center, EnvironmentsIcon, Flex, HStack, Icon, Text } from 'components';
import { Input, RiverySwitch } from 'components/Form';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { useCopyToClipboardWithToast } from 'hooks/useCopyToClipboard';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { useGetEnvironmentsQuery } from '../environments.query';
import { useOpacityCalculate } from '../helpers';
import './VariablesManager.scss';
import { EnvironmentValue } from './VariablesTable';

export const useNewVariableColumns = isNew => {
  return useMemo(
    () => [
      {
        Header: 'Environment',
        accessor: 'environment_name',
        Cell: EnvNameCell,
        weight: '330px',
      },
      {
        Header: VariableHeader,
        id: 'variable_value',
        Cell: VariableInput,
        getProps: { newVariable: isNew },
      },
    ],
    [isNew],
  );
};

const useHasValue = (formApi, environment) => {
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const env_id = environmentsArray.find(
    compare('environment_name', environment),
  ).cross_id;

  const name = `values.${getOId(env_id)}`;
  return {
    name,
    fieldName: getOId(env_id),
    value: formApi.watch(name),
    hasValue: typeof formApi.watch(name) == 'string',
  };
};

const setValueForAll = (formApi, value, isHeader = false) => {
  const variableValues = formApi.watch('values');
  return Object.entries(variableValues)?.forEach(([key, val]) => {
    const values = formApi.watch('values');
    if (isHeader && key !== 'undefined') {
      return formApi.setValue(
        'values',
        {
          ...values,
          [key]: values[key] ?? value,
        },
        { shouldDirty: true },
      );
    }
    if (typeof val == 'string') {
      return value
        ? formApi.setValue(
            'values',
            { ...values, [key]: value },
            { shouldDirty: true },
          )
        : null;
    }
  });
};

const removeValueForAll = formApi => {
  const variableValues = formApi.getValues('values');
  return Object.entries(variableValues)?.forEach(([key, _]) => {
    const values = formApi.watch('values');
    return formApi.setValue(
      'values',
      {
        ...values,
        [key]: undefined,
      },
      { shouldDirty: true },
    );
  });
};

function VariableHeader() {
  const formApi = useFormContext();
  const allEnabled = Object.values(formApi?.watch('values')).every(
    val => typeof val == 'string',
  );
  const allDisabled = Object.values(formApi?.watch('values')).every(
    val => typeof val !== 'string',
  );

  const menuItems = [
    {
      value: 'Enable All',
      onClick: () => setValueForAll(formApi, '', true),
      isDisabled: Boolean(allEnabled),
    },
    {
      value: 'Disable All',
      onClick: () => removeValueForAll(formApi),
      isDisabled: Boolean(allDisabled),
    },
  ];
  return (
    <HStack py={1}>
      <Text>Variable</Text>
      <RiveryDropdown
        menuItems={menuItems}
        menuListStyle={{
          mt: '-10px',
          position: 'absolute',
          right: -5,
        }}
        menuButtonStyle={{
          position: 'absolute',
          right: 0,
          _hover: { bg: 'transparent' },
          _expanded: { bg: 'transparent' },
        }}
      />
    </HStack>
  );
}

function EnvironmentSwitch({ name: environment_name }) {
  const formApi = useFormContext();
  const { name, fieldName } = useHasValue(formApi, environment_name);
  const currentValue = formApi.getValues(name);

  useEffect(() => {
    if (typeof currentValue == 'boolean') {
      const values = formApi.watch('values');
      if (currentValue) {
        return formApi.setValue('values', {
          ...values,
          [fieldName]: '',
        });
      }
      if (currentValue === false) {
        return formApi.setValue('values', {
          ...values,
          [fieldName]: undefined,
        });
      }
    }
  }, [currentValue, fieldName, formApi, name]);

  return (
    <RiverySwitch
      isChecked={currentValue !== undefined}
      pl="3"
      label=""
      name={name}
      api={formApi}
      allowEmptyValue
      aria-label={environment_name}
    />
  );
}

function EnvNameCell({
  row: {
    original: { environment_name, color },
  },
}) {
  return (
    <Flex alignItems="center" w="100%" gap={1.5}>
      <Center>
        <EnvironmentSwitch name={environment_name} />
      </Center>
      <Icon
        as={EnvironmentsIcon}
        boxSize={6}
        p={1}
        bg={color}
        borderRadius={50}
        color="var(--chakra-colors-white)"
      />
      <EnvironmentValue
        justifyContent="start"
        pl={1}
        fontWeight="normal"
        name={environment_name}
      />
    </Flex>
  );
}

function VariableInput({ row }) {
  const formApi = useFormContext();
  const { name, hasValue, value } = useHasValue(
    formApi,
    row.original.environment_name,
  );

  const applyValueToAllEnabled = useCallback(
    () => setValueForAll(formApi, value),
    [formApi, value],
  );

  const { copyToClipboard } = useCopyToClipboardWithToast();

  const menuItems = [
    {
      value: 'Apply value for all enabled environments',
      isDisabled: !hasValue,
      onClick: () => applyValueToAllEnabled(),
    },
    {
      value: 'Copy Value',
      isDisabled: !hasValue,
      onClick: () => copyToClipboard(value),
    },
  ];

  const opacityBG = useOpacityCalculate(row.original.color, 0.3);

  return (
    <Flex
      position="relative"
      w="100%"
      borderLeft="2px solid"
      borderLeftColor={row.original.color}
    >
      <HStack
        w="100%"
        textOverflow="ellipsis"
        overflow="hidden"
        whiteSpace="nowrap"
        bgColor={hasValue ? opacityBG : 'transparent'}
        pl={3}
        pt={2}
      >
        <Input
          w="85%"
          textOverflow="ellipsis"
          name={name}
          placeholder="Enter value..."
          api={formApi}
        />
      </HStack>
      <RiveryDropdown
        menuListStyle={{
          mt: '-10px',
          position: 'absolute',
          right: 0,
          w: '300px',
        }}
        menuButtonStyle={{
          position: 'absolute',
          right: 0,
          _hover: { bg: 'transparent' },
          _expanded: { bg: 'transparent' },
        }}
        placement="bottom"
        menuItems={menuItems}
      />
    </Flex>
  );
}

export const resetFormTableValues = (data, variable, formApi) => {
  const currentVar: Record<string, any> = data.find(
    (v: any) => v.name === variable,
  );
  const variablesValueArray = Object.entries(currentVar).map(([_, value]) => ({
    [value?.id]: value?.value,
  }));
  const environmentValues = Object.assign({}, ...variablesValueArray);
  formApi.reset({
    values: { ...environmentValues },
    variable_name: variable,
  });
};
