import { Breadcrumbs, ButtonCreate, Flex, RiveryTable, View } from 'components';
import { ScopesGuard } from 'hooks/useAllowedScopes';
import { useMemo, useState } from 'react';
import { Column, useSortBy } from 'react-table';
import { useEnvironmentsActions } from 'store/environments';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';
import { compare } from 'utils/array.utils';
import { ActionsCell, Value, Variable } from './TableCells';
import { VariableDrawer } from './VariablesDrawer';

export const variablesScopes = ['variable:edit', 'variable:delete'];

export default function EnvironmentVariables() {
  const [selectedVariable, setSelectedVariable] = useState(null);
  const { setDrawerState } = useEnvironmentsActions();
  const { selectedEnv } = useSelectedEnvironment();

  const variablesArray = useMemo(
    () =>
      selectedEnv
        ? Object.entries(selectedEnv?.variables)?.map(([key, value]) => ({
            variable: key,
            value,
          }))
        : [],
    [selectedEnv],
  );

  const columns = useMemo(
    () =>
      variablesColumns.map(col => ({
        getProps: { setVariable: setSelectedVariable },
        ...col,
      })),
    [],
  );

  const value = useMemo(
    () => variablesArray.find(compare('variable', selectedVariable))?.value,
    [selectedVariable, variablesArray],
  );

  return (
    <View as={Flex} flexDir="column" py={2} px={4}>
      <Breadcrumbs links={[{ label: 'Variables' }, { label: 'List' }]} />
      <RiveryTable
        entityType="Variables"
        ariaLabel="variables table"
        useSortBy={useSortBy}
        columns={columns}
        data={variablesArray}
        contentProps={{ border: 'none' }}
        extraControls={
          <ScopesGuard scopes={variablesScopes}>
            <ButtonCreate
              ml="auto"
              mr="3px"
              mb="3px"
              aria-label="add variable"
              onClick={() => {
                setSelectedVariable(null);
                setDrawerState(true);
              }}
            >
              Add Variable
            </ButtonCreate>
          </ScopesGuard>
        }
        paginationConfig={{
          autoResetPage: false,
          autoResetGlobalFilter: false,
          initialState: { pageSize: 20 },
        }}
        filterLabel="Search Variable"
      />
      <VariableDrawer variable={selectedVariable} value={value} />
    </View>
  );
}

const variablesColumns: Column[] = [
  {
    Header: 'Variable',
    accessor: 'variable',
    sortBy: 'variable',
    weight: '600px',
    Cell: Variable,
    headerProps: { py: 3 },
  },
  {
    Header: 'Value',
    accessor: 'value',
    sortBy: 'value',
    Cell: Value,
    weight: '500px',
  },
  {
    id: 'actions',
    Cell: ActionsCell,
  },
];
