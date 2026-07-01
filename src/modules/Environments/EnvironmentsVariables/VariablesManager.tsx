import { ButtonCreate, GridBox, HStack, RiveryTable, Text } from 'components';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import React, { useEffect, useMemo, useState } from 'react';
import { useSortBy } from 'react-table';
import { useEnvironments, useEnvironmentsActions } from 'store/environments';
import { useEnvironmentsVariables } from 'store/environments/hooks/useGetEnvironment';
import { TabContent } from '../components/TabContent';
import { ActionDrawer } from './ActionDrawer';
import './VariablesManager.scss';
import { useVariablesColumns } from './VariablesTable';
import { TableSearch } from './VariablesTableSearch';

export function VariablesManager() {
  const [variable, setVar] = useState(null);
  const [filters, setFilters] = useState({
    environments: null,
    variables: null,
  });
  const filtersOn = useMemo(
    () => Boolean(filters['variables'] || filters['environments']),
    [filters],
  );

  // create an api for filters ONCE only (avoids rerender)
  const filtersApi = useMemo(
    () => ({
      update: (filterValue, field) =>
        setFilters(state => {
          if (typeof filterValue === 'string') {
            const newFilter = state[field]
              .split(',')
              .filter(value => value !== filterValue)
              .join(',');
            return { ...state, [field]: newFilter };
          } else {
            const chainedFilters = filterValue?.map(f => f?.value)?.join(',');
            return {
              ...state,
              [field]: chainedFilters,
            };
          }
        }),
      reset: () => setFilters(() => ({ environments: null, variables: null })),
    }),
    [],
  );

  return (
    <TabContent loading={false}>
      <Drawer variable={variable}>
        <DrawerAddButton onClosed={setVar} />
      </Drawer>
      <TableSearch
        filtersOn={filtersOn}
        updateFilter={filtersApi.update}
        clearAllFilters={filtersApi.reset}
      />
      <VariablesTable
        varFilter={filters['variables']}
        envFilter={filters['environments']}
        onEditVariable={setVar}
      />
    </TabContent>
  );
}

const Drawer = React.memo(ActionDrawerParent);
// const VariablesTableMemo = React.memo(VariablesTable);

const handlers = {
  headerHandlers: { isCustom: true },
  rowHandlers: { isCustomPadding: true },
  paginationConfig: {
    autoResetPage: false,
    autoResetGlobalFilter: false,
    initialState: { pageSize: 20 },
  },
};
function VariablesTable({ varFilter, envFilter, onEditVariable }) {
  const variables = useEnvironmentsVariables();
  const columns = useVariablesColumns(onEditVariable, envFilter);
  const data = useMemo(() => {
    if (varFilter) {
      const filterArray = varFilter?.split(',');
      return variables.filter(({ name }) => filterArray.includes(name));
    }
    return variables;
  }, [varFilter, variables]);

  return (
    <GridBox overflow="hidden">
      {data.length > 0 ? (
        <RiveryTable
          {...handlers}
          entityType="Variables"
          ariaLabel="all variables"
          inline
          columns={columns}
          data={data}
          contentProps={{ borderColor: 'border' }}
          useSortBy={useSortBy}
          useIdAsIndex={false}
        />
      ) : (
        <PageOverlaySpinner />
      )}
    </GridBox>
  );
}

function DrawerAddButton({ onClosed }) {
  const { setDrawerState } = useEnvironmentsActions();
  const { isDrawerOpen } = useEnvironments();

  useEffect(() => {
    if (!isDrawerOpen) {
      onClosed(null);
    }
  }, [isDrawerOpen, onClosed]);
  return (
    <ButtonCreate
      mr="3px"
      mt="3px"
      aria-label="add variable"
      onClick={() => setDrawerState(true)}
    >
      Add Variable
    </ButtonCreate>
  );
}
function ActionDrawerParent({ variable, children }) {
  return (
    <>
      <HStack justify="space-between">
        <Text color="font-secondary">
          View and set all variable values across all environments
        </Text>
        {children}
      </HStack>
      <ActionDrawer variable={variable} />
    </>
  );
}
