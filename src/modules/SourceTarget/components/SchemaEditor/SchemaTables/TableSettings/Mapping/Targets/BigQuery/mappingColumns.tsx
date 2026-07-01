import { Grid, PageOverlaySpinner, RenderGuard, RiveryTable } from 'components';
import { SQLDialectsValues } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetSettings/TargetBigQuery';
import { IModifiedColumn } from 'modules/SourceTarget/store';
import { useState } from 'react';
import { useSortBy } from 'react-table';
import ReloadTableMetadata from '../../../components/ReloadTableMetadata';
import { useTableSettings } from '../../../form.hooks';
import { ColumnMappingEditor } from '../../components/AllColumns/ColumnMappingEditor';
import { AddCalculated } from '../../components/AllColumns/TableComponents/AddCalculated';
import { wrapperProps } from '../../components/AllColumns/TableComponents/tableStyle';
import { DeleteColumn } from '../../components/DeleteColumn';
import { useColumns } from '../../hooks/useColumns';
import { useCombinedColumns } from '../../hooks/useCombinedColumns';
import { useModifiedColumns } from '../../hooks/useModifiedColumns';
import { columns } from './columns';
import { SQLAlert } from './SQLTableAlert';
import { useMainRiverFormContext } from 'hooks/useMainRiverFormContext';
import { useMainFormColumnsDefinitions } from 'modules/SourceTarget/components/form';

const deleteColumn = {
  Header: '',
  id: 'delete-column',
  Cell: DeleteColumn,
  weight: 'min-content',
};

export function AllColumns({ isDisabled, isStandardSql }) {
  const formApi = useMainRiverFormContext();
  const { isCustomQuery } = useMainFormColumnsDefinitions();
  const riverSqlDialect = formApi?.watch(
    'river.properties.target.sql_dialect' as any,
  );
  const { value: tableSqlDialect } = useTableSettings(
    'additional_target_settings.sql_dialect',
  );
  const { columns: metaColumns, isLoading, loadingMetadata } = useColumns();
  const api = useModifiedColumns();
  const [allColumns] = useCombinedColumns(api?.modifiedColumnsMap, null, null);
  const [mappingDraft, setEditor] = useState<IModifiedColumn>();
  const closeEditor = () => setEditor(undefined);

  const effectiveSqlDialect = tableSqlDialect ?? riverSqlDialect;

  let filteredColumns = columns.filter(column => {
    if (isCustomQuery && column.id === 'is_selected') {
      return false;
    }
    if (
      ['is_partition', 'partition_granularity', 'cluster_key'].includes(
        column.accessor,
      ) &&
      effectiveSqlDialect === SQLDialectsValues.LEGACY
    ) {
      return false;
    }
    return true;
  });

  if (isCustomQuery) {
    const lastColumn = filteredColumns[filteredColumns.length - 1];
    filteredColumns = [
      ...filteredColumns.slice(0, -1),
      deleteColumn,
      lastColumn,
    ];
  }

  const columnsWithApi = filteredColumns.map(column => ({
    ...column,
    getProps: { ...api, isDisabled },
    onOpenEditor: setEditor,
    openEditor: mappingDraft,
  }));

  const showSqlAlert =
    effectiveSqlDialect === SQLDialectsValues.STANDARD ||
    (isStandardSql && !effectiveSqlDialect);
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
          wrapperProps={{
            ...wrapperProps,
          }}
          contentProps={{
            sx: {
              '& [aria-label="columns list"]': {
                border: '1px solid var(--chakra-colors-gray-300)',
                borderRadius: 4,
                mt: showSqlAlert && 12,
              },
            },
            ...(isCustomQuery && {
              h: '100%',
              overflow: 'auto',
            }),
          }}
          rowHandlers={{
            isRowSelected: ({ name }) => name === mappingDraft?.name,
          }}
          clearFilters={
            <>
              <ReloadTableMetadata isDisabled={isDisabled} />
              {showSqlAlert && <SQLAlert />}
            </>
          }
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
          metadata={metaColumns}
          onDelete={columnName => {
            api.removeColumn(columnName);
            closeEditor();
          }}
        />
      ) : null}
    </Grid>
  );
}
