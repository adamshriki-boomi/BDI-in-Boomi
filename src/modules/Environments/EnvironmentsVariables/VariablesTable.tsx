import { CenterProps, HStack } from '@chakra-ui/react';
import { Box, ConfirmationModal, EditableText, Text } from 'components';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { useToastComponent } from 'hooks/useToast';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { useToggle } from 'react-use';
import { useEnvironmentsActions } from 'store/environments';
import { getOId } from 'utils/api.sanitizer';
import {
  useGetEnvironmentsQuery,
  useLazyGetEnvironmentsQuery,
} from '../environments.query';
import { useOpacityCalculate } from '../helpers';
import './VariablesManager.scss';

const createColumn = ({ environment_name, color, cross_id }) => ({
  Header: () => (
    <EnvironmentValue
      py={3}
      px={2}
      name={environment_name}
      borderBottom="2px solid"
      borderBottomColor="background-action-hover"
      textAlign="center"
      bg="white"
    />
  ),
  accessor: environment_name,
  Cell: ({ value, row }) => (
    <EnvironmentValue
      environmentId={getOId(cross_id)}
      variableName={row.original.name}
      color={color}
      name={value?.value}
      fontWeight="normal"
    />
  ),
  weight: 'minmax(130px, 100%)',
});
const tableHeaderStyle = {
  sx: {
    zIndex: '2 !important',
    borderBottom: '2px solid',
    borderBottomColor: 'background-action-hover',
    '& > svg': {
      position: 'absolute',
      right: '24px',
    },
  },
};
const nameColumn = {
  Header: () => (
    <EnvironmentValue justifyContent="center" name="Variable" bg="white" />
  ),
  accessor: 'name',
  sortBy: 'name',
  headerProps: {
    ...tableHeaderStyle,
    position: 'sticky',
    left: 0,
    zIndex: 1,
    display: 'inline-flex',
  },
  styleProps: { position: 'sticky', left: 0, zIndex: 1 },
  weight: 'minmax(150px, 180px)',
  Cell: ({ value }) => (
    <EnvironmentValue p={2} name={value} fontWeight="normal" />
  ),
};

export const useVariablesColumns = (setDrawerVariable, filter) => {
  const environmentsFilter = filter?.split(',');
  const isFilterOn = Boolean(filter);
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const envColumns = React.useMemo(() => {
    const filtered = environmentsArray
      ? isFilterOn
        ? environmentsArray.filter(({ environment_name }) =>
            environmentsFilter.includes(environment_name),
          )
        : environmentsArray
      : [];
    return filtered?.map(createColumn);
  }, [environmentsArray, environmentsFilter, isFilterOn]);
  return React.useMemo(
    () => [
      nameColumn,
      ...envColumns,
      {
        Header: '',
        id: 'actions',
        Cell: Actions,
        headerProps: {
          ...tableHeaderStyle,
          position: 'sticky',
          right: 0,
          zIndex: 1,
        },
        styleProps: { position: 'sticky', right: 0, zIndex: 1 },
        getProps: { setDrawerVariable },
      },
    ],
    [envColumns, setDrawerVariable],
  );
};

function Actions({ row: { original }, column: { getProps } }) {
  const { success } = useToastComponent();
  const { deleteVariable, setDrawerState } = useEnvironmentsActions();
  const [fetchEnvironments] = useLazyGetEnvironmentsQuery();
  const [show, toggle] = useToggle(false);
  const onDelete = useCallback(async () => {
    const response: any = await deleteVariable({
      variable_name: original.name,
      environments: original?.ids ?? [''],
    });
    await fetchEnvironments('');
    if (response?.payload) {
      success({ description: response.payload?.message });
    }
  }, [
    deleteVariable,
    fetchEnvironments,
    original?.ids,
    original.name,
    success,
  ]);

  const onEdit = useCallback(() => {
    setDrawerState(true);
    getProps.setDrawerVariable(original.name);
  }, [getProps, original.name, setDrawerState]);

  const items = [
    {
      ...RiveryDropdown.EditMenuItem,
      onClick: () => onEdit(),
    },
    {
      ...RiveryDropdown.DeleteMenuItem,
      onClick: () => toggle(true),
    },
  ];
  return (
    <Box bg="white">
      <RiveryDropdown
        menuButtonAriaLabel={`menu-${original.name}`}
        menuItems={items}
        menuListStyle={{
          position: 'absolute',
          right: 0,
          bottom: -8,
          h: 'fit-content',
        }}
        menuButtonStyle={{ _expanded: { bg: 'gray.300' }, bg: 'transparent' }}
        placement="left"
      />
      <ConfirmationModal
        show={show}
        onClose={toggle}
        onConfirm={onDelete}
        title={`Delete "${original.name}" Variable?`}
        description="The variable will be removed from all environments."
        confirmLabel="Delete"
        variant="warning"
      />
    </Box>
  );
}

export function EnvironmentValue({
  name,
  color = 'transparent',
  environmentId = null,
  variableName = null,
  ...rest
}: CenterProps & {
  name: string;
  color?: string;
  environmentId?: string;
  variableName?: string;
}) {
  const [value, setValue] = useState(name);
  const { updateVariableValue } = useEnvironmentsActions();
  const setVariableValue = useCallback(
    async value => {
      if (environmentId) {
        setValue(value);
        await updateVariableValue({
          env_id: environmentId,
          variable: variableName,
          variable_value: value,
        });
      }
    },
    [environmentId, updateVariableValue, variableName],
  );
  const opacityBG = useOpacityCalculate(color, 0.3);

  return (
    <HStack
      bg={typeof value == 'string' ? opacityBG : 'transparent'}
      h="100%"
      w="100%"
      fontWeight="medium"
      {...rest}
    >
      {variableName ? (
        <EditableText
          wrapperStyle={{ w: 'full' }}
          text={value}
          textStyle={{ color: 'font', fontWeight: 'normal' }}
          inputStyle={{
            textAlign: 'center',
          }}
          inputProps={{ placeholder: '' }}
          previewStyle={{
            cursor: 'text !important',
            justifyContent: 'center',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            w: '90%',
          }}
          onChange={setVariableValue}
          allowEmpty
          hideIcon
        />
      ) : (
        <Text
          w="90%"
          title={value}
          textOverflow="ellipsis"
          overflow="hidden"
          whiteSpace="nowrap"
          color="font"
        >
          {value}
        </Text>
      )}
    </HStack>
  );
}
