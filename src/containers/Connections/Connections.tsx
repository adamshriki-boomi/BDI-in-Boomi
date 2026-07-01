import { AppRoutes } from 'app/routes';
import {
  ButtonCreate,
  ConfirmationButtonModal,
  IndexColumn,
  RiveryButton,
  RiveryTable,
  TableDateTime,
  View,
} from 'components';
import { ConnectionModal } from 'modules';
import { useEffect } from 'react';
import { MdFlashOn } from 'react-icons/md';
import { generatePath, Redirect } from 'react-router-dom';
import { Column, useSortBy } from 'react-table';
import { useConnections } from 'store/connections';
import { useCore } from 'store/core';

export function LegacyRouteConnections({
  match: {
    params: { env, account },
  },
}) {
  return (
    <Redirect
      to={generatePath(AppRoutes.CONNECTIONS, { env, account })}
      push={false}
    />
  );
}

// TODO add delete connection api
const onConfirmDelete = ev => {
  console.log(ev.target.value);
};
// TODO add test connection logic
const onTestConnection = ev => {
  console.log(ev.target.value);
};

const TestConnectionButton = ({ is_test_connection }) => (
  <RiveryButton
    variant="primary"
    label="Test Connection"
    size="sm"
    p="1"
    rounded="full"
    onClick={onTestConnection}
    leftIcon={<MdFlashOn />}
  />
);

const DeleteButton = ({
  row: {
    original: { connection_name },
  },
}) => (
  <ConfirmationButtonModal
    name={connection_name}
    type="connection"
    onConfirm={onConfirmDelete}
  />
);

export function Connections() {
  const { envId } = useCore();
  const { connectionsArray, fetchConnections } = useConnections();

  useEffect(() => {
    fetchConnections();
  }, [envId, fetchConnections]);

  return (
    <View>
      <RiveryTable
        entityType="Connections"
        ariaLabel="connections list"
        columns={headers}
        data={connectionsArray}
        useSortBy={useSortBy}
        extraControls={
          <ButtonCreate
            to="/connection"
            fontWeight="bold"
            mr={2}
            aria-label="New Connection"
          >
            New Connection
          </ButtonCreate>
        }
      />
    </View>
  );
}

const headers: Column[] = [
  IndexColumn,
  {
    Header: 'Connection',
    accessor: 'connection_name',
    Cell: ({
      row: {
        original: { connection_name, connection_type, cross_id },
      },
    }) => (
      <ConnectionModal
        mode={ConnectionModal.Mode.EDIT}
        header={`${connection_type} Connection`}
        type={connection_type}
        crossId={cross_id}
        dataSourceId=""
        onSave={console.log}
        onTest={console.log}
        buttonProps={{
          label: connection_name,
          variant: 'link',
          size: 'small',
        }}
      />
    ),
    sortBy: 'connection_name',
  },
  {
    Header: 'Type',
    accessor: 'connection_type',
    Cell: ({
      row: {
        original: { connection_name, connection_type, icon, size },
      },
    }) => (
      <img
        key="icon"
        title={connection_type}
        src={`/${icon}`}
        alt={connection_name}
        height={size}
        width={size}
      />
    ),
    styleProps: { justifyContent: 'center' },
    headerProps: { justifyContent: 'center' },
    weight: 'min-content',
  },
  {
    Header: 'Modified',
    accessor: 'connection_update_time',
    Cell: TableDateTime,
    weight: 'min-content',
  },
  {
    Header: 'Test',
    accessor: 'actions.test',
    Cell: TestConnectionButton,
    styleProps: { justifyContent: 'center' },
    headerProps: { justifyContent: 'center' },
    weight: 'min-content',
  },
  {
    Header: 'Delete',
    accessor: 'actions.delete',
    Cell: DeleteButton,
    styleProps: { justifyContent: 'center' },
    headerProps: { justifyContent: 'center' },
    weight: 'min-content',
  },
];
