import { Grid, PageOverlaySpinner, RenderGuard, RiveryTable } from 'components';
import { IModifiedColumn } from 'modules/SourceTarget/store';
import { useState } from 'react';
import { useSortBy } from 'react-table';
import ReloadTableMetadata from '../../../components/ReloadTableMetadata';
import { ColumnMappingEditor } from '../../components/AllColumns/ColumnMappingEditor';
import { AddCalculated } from '../../components/AllColumns/TableComponents/AddCalculated';
import {
  contentProps,
  wrapperProps,
} from '../../components/AllColumns/TableComponents/tableStyle';
import { DeleteColumn } from '../../components/DeleteColumn';
import { useColumns } from '../../hooks/useColumns';
import { useCombinedColumns } from '../../hooks/useCombinedColumns';
import { useModifiedColumns } from '../../hooks/useModifiedColumns';
import { columns } from './columns';
import { useMainFormColumnsDefinitions } from 'modules/SourceTarget/components/form';

// Delete column config for custom query
const deleteColumnConfig = {
  Header: '',
  id: 'delete-column',
  Cell: DeleteColumn,
  weight: 'min-content',
};

export function AllColumns({ isDisabled }) {
  const { isCustomQuery } = useMainFormColumnsDefinitions();
  const { columns: metaColumns, isLoading, loadingMetadata } = useColumns();
  const api = useModifiedColumns();
  const [allColumns] = useCombinedColumns(api?.modifiedColumnsMap, null, null);
  const [mappingDraft, setEditor] = useState<IModifiedColumn>();
  const closeEditor = () => setEditor(undefined);

  // Build columns with delete column for custom query
  let baseColumns = columns.filter(
    column => !(isCustomQuery && column.id === 'is_selected'),
  );

  // Add delete column before the last column (edit-column) for custom query
  if (isCustomQuery) {
    const lastColumn = baseColumns[baseColumns.length - 1];
    baseColumns = [...baseColumns.slice(0, -1), deleteColumnConfig, lastColumn];
  }

  const columnsWithApi = baseColumns.map(column => ({
    ...column,
    getProps: { ...api, isDisabled },
    onOpenEditor: setEditor,
    openEditor: mappingDraft,
  }));

  return (
    <Grid
      gridTemplateColumns={mappingDraft ? '1fr min-content' : '1fr 0px'}
      position="relative"
      h="full"
      overflow="hidden"
    >
      <RenderGuard condition={isLoading || loadingMetadata}>
        <PageOverlaySpinner />
      </RenderGuard>
      <RenderGuard condition={Boolean(allColumns?.length)}>
        <RiveryTable
          ariaLabel="columns list"
          entityType="Columns"
          columns={columnsWithApi}
          data={allColumns}
          noPagination
          useSortBy={useSortBy}
          title={null}
          wrapperProps={{ ...wrapperProps }}
          contentProps={{
            ...contentProps,
            ...(isCustomQuery && {
              h: '100%',
              overflow: 'auto',
            }),
          }}
          rowHandlers={{
            isRowSelected: ({ name }) => name === mappingDraft?.name,
          }}
          clearFilters={<ReloadTableMetadata isDisabled={isDisabled} />}
          extraControls={<AddCalculated isDisabled={isDisabled} api={api} />}
        />
      </RenderGuard>
      {mappingDraft ? (
        <ColumnMappingEditor
          onClose={closeEditor}
          value={mappingDraft}
          onChange={column => {
            api.updateColumn(column.name, { ...column });
            closeEditor();
          }}
          onDelete={columnName => {
            api.removeColumn(columnName);
            closeEditor();
          }}
          metadata={metaColumns}
        />
      ) : null}
    </Grid>
  );
}
