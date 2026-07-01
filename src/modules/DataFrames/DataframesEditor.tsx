import { Icon } from '@chakra-ui/react';
import { getDataV1 } from 'api/api.proxy';
import { downloadPreSignedURLs, PollingStatus } from 'api/endpoints/files.api';
import { CloseIcon, ConfirmationModal, RiveryTable, Text } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { useToastComponent } from 'hooks/useToast';
import React, { useCallback, useMemo, useState } from 'react';
import { Column, useSortBy } from 'react-table';
import { useToggle } from 'react-use';
import { useConnectionsByTypes } from 'store/connectionTypes';
import { getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { DataFrameEditFormDialog } from './DataframeForm';
import {
  clearDataframe,
  useDeleteDataframeMutation,
  useGetDataframesQuery,
} from './store';
import { IDataframe } from './store/dataframes.types';

const emptyArray: Partial<IDataframe>[] = [];
/**
 * this prop is used for displaying the custom landing zone in order
 * to allow easier sorting on that column in DataframesEditor
 * when saving/editing a dataframe - this prop should be removed
 */
const customLandingZoneProp = 'customLandingZone';
export function DataframesEditor() {
  const { data = emptyArray, isLoading, isFetching } = useGetDataframesQuery();
  const [onDelete, deleteStatus] = useDeleteDataframeMutation();
  const [showEditDialog, toggleEditDialog] = useToggle(false);
  const [editDraft, setEditDraft] = useState(undefined);
  const [pending, setPending] = useState<boolean>(false);

  const onShowUpdateDialog = useCallback(
    (dataFrame: IDataframe & { [customLandingZoneProp]: string }) => {
      const { customLandingZone, ...dataFramePayload } = dataFrame;
      setEditDraft(dataFramePayload);
      toggleEditDialog(true);
    },
    [toggleEditDialog, setEditDraft],
  );
  const dataframeTableColumns = useDataframeTableColumns({
    onDelete,
    setPending,
    onUpdate: onShowUpdateDialog,
  });
  // create unique array of required connection types
  const connectionTypes = useMemo(() => {
    return [
      ...new Set(
        data
          .map(item => item?.connection_settings?.storage_type)
          .filter(Boolean),
      ),
    ];
  }, [data]);

  const connections = useConnectionsByTypes(connectionTypes);
  const shouldShowSpinner = Boolean(
    isFetching || deleteStatus.isLoading || pending,
  );
  const dataframes = data.map(dataFrame => ({
    ...dataFrame,
    [customLandingZoneProp]: findConnectionName(
      connections,
      dataFrame?.connection_settings?.connection,
    ),
  }));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {shouldShowSpinner ? <PageOverlaySpinner /> : null}
      <DataFrameEditFormDialog
        show={showEditDialog}
        toggle={toggleEditDialog}
        dataFrame={editDraft}
      />
      <RiveryTable
        ariaLabel="data frame editor"
        useSortBy={useSortBy}
        noPagination
        entityType="DataFrames"
        columns={dataframeTableColumns}
        data={dataframes}
        fixedPageSize
        noItemsMsg="No DataFrames yet"
        emptyResultsMsg="no results"
        globalFilter={dataframesGlobalFilter}
        filterLabel="Search Dataframes"
      />
    </>
  );
}

enum DataframeAction {
  DELETE,
  DOWNLOAD,
  EDIT,
  CLEAR_VALUES,
}

function toDataframeActions(
  onDelete,
  onDownload,
  onEdit,
  onClearValues,
  isCustomLandingZone,
) {
  return [
    {
      ...RiveryDropdown.EditMenuItem,
      onClick: onEdit,
      id: DataframeAction.EDIT,
    },
    {
      ...RiveryDropdown.DonwloadMenuItem,
      onClick: onDownload,
      id: DataframeAction.DOWNLOAD,
    },
    !isCustomLandingZone && {
      value: 'Clear Values Now',
      icon: <Icon as={CloseIcon} color="icon" boxSize={5} />,
      onClick: onClearValues,
      id: DataframeAction.CLEAR_VALUES,
    },
    {
      ...RiveryDropdown.DeleteMenuItem,
      onClick: onDelete,
      id: DataframeAction.DELETE,
    },
  ];
}

const downloadDF = dataframe => {
  return getDataV1(true, `/dataframes/${dataframe}/download`).then(
    data => data?.operation_id,
  );
};

export function DataframeListActionsCell({
  row: {
    original: { name },
    original,
  },
  column: { getProps },
  onDelete,
  setPending,
}) {
  const { success, info, error } = useToastComponent();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const isCustomLandingZone =
    original?.connection_settings &&
    Boolean(Object.keys(original.connection_settings).length);

  const notifyDownloadCompleted = useCallback(
    (status: PollingStatus, actionType: string = 'Download') => {
      setPending(false);
      switch (status) {
        case PollingStatus.COMPLETED:
          success({ description: `${actionType} Completed` });
          break;
        case PollingStatus.EMPTY:
          info({ description: `No Files to ${actionType}` });
          break;
        case PollingStatus.FAILED:
          error({ description: `${actionType} Failed` });
          break;
      }
    },
    [error, info, setPending, success],
  );

  const triggerDownload = useCallback(async () => {
    setPending(true);
    const dataframeOperationId = await downloadDF(name);
    if (dataframeOperationId) {
      await downloadPreSignedURLs(
        dataframeOperationId,
        notifyDownloadCompleted,
      );
    } else {
      notifyDownloadCompleted(PollingStatus.FAILED);
    }
  }, [name, notifyDownloadCompleted, setPending]);

  const triggerClearDataframe = useCallback(
    dataframe => {
      setPending(true);
      clearDataframe(dataframe, notifyDownloadCompleted);
    },
    [notifyDownloadCompleted, setPending],
  );

  const actions = useMemo(
    () =>
      toDataframeActions(
        () => setShowDeleteConfirmation(true),
        () => triggerDownload(),
        () => getProps.onUpdate(original),
        () => triggerClearDataframe(original.name),
        isCustomLandingZone,
      ),
    [
      isCustomLandingZone,
      triggerDownload,
      getProps,
      original,
      triggerClearDataframe,
    ],
  );

  return (
    <>
      <RiveryDropdown
        isLazy
        menuButtonAriaLabel={`toggle dataframe ${name}`}
        menuItems={actions}
        id={`dataframe ${name} actions`}
        preventOverflow
        placement="left"
      />
      {showDeleteConfirmation ? (
        <ConfirmationModal
          confirmLabel="Delete"
          title={`Delete '${name}' DataFrame?`}
          description="This dataframe will be deleted in all dependent Data Flows"
          onConfirm={() => {
            onDelete(name);
            setShowDeleteConfirmation(false);
          }}
          onClose={() => setShowDeleteConfirmation(false)}
          show
          variant="error"
        />
      ) : null}
    </>
  );
}

function DataframeName(props) {
  const {
    value,
    row: { original },
    column: { getProps },
  } = props;
  return (
    <RiveryButton
      overflow="hidden"
      fontSize="sm"
      fontWeight="normal"
      p={0}
      border={0}
      _hover={{ textDecoration: 'underline' }}
      _active={{ bg: 'transparent', boxShadow: 'none' }}
      _focus={{ bg: 'transparent', boxShadow: 'none' }}
      bg="transparent"
      variant="link"
      label={
        <Text overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
          {value}
        </Text>
      }
      onClick={() => getProps.onUpdate(original)}
    />
  );
}

const findConnectionName = (connections, connectionId) => {
  const connection = connections?.find(
    compare('cross_id', connectionId, getOId),
  );
  return connection?.connection_name;
};
function CustomLandingZone({ value }) {
  return <span>{value}</span>;
}

const tableStyleProps = {
  styleProps: { py: 1 },
  headerProps: { py: 3 },
};

function useDataframeTableColumns({
  onDelete,
  onUpdate,
  setPending,
}): Column[] {
  return useMemo(() => {
    const result = [
      {
        Header: 'DataFrame Name',
        accessor: 'name',
        sortBy: 'name',
        Cell: DataframeName,
        weight: 'minmax(200px, 1fr)',
        getProps: {
          onUpdate,
        },
        ...tableStyleProps,
      },
      {
        Header: 'Custom Landing Zone',
        accessor: customLandingZoneProp,
        sortBy: customLandingZoneProp,
        Cell: CustomLandingZone,
        ...tableStyleProps,
      },
      {
        Header: '',
        accessor: 'cross_id',
        Cell: props => (
          <DataframeListActionsCell
            {...props}
            onDelete={onDelete}
            setPending={setPending}
          />
        ),
        getProps: {
          onUpdate,
        },
        weight: 'min-content',
        ...tableStyleProps,
      },
    ];
    return result;
  }, [onUpdate, onDelete, setPending]);
}

function dataframesGlobalFilter(rows, _, filter) {
  if (!filter) {
    return rows;
  }
  const filterRegEx = new RegExp(filter.replace(/\\+$/, ''), 'gi');
  return rows?.filter(({ original: { name } }) => name.match(filterRegEx));
}
