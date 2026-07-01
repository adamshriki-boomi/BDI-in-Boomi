import { ExTable } from '@boomi/exosphere/dist/react/table';
import { ColDef, GridOptions } from 'ag-grid-community';
import { Box, Text } from 'components';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { TagsCellRenderer } from './CustomTableComponents';
import { RiveryExoTableProps, RiveryExoTableRef } from './types';

const RiveryExoTable = forwardRef<RiveryExoTableRef, RiveryExoTableProps>(
  (
    {
      columns,
      data,
      editRow = false,
      deleteRow = false,
      noRowsMessage,
      onDataChange,
      onRowDelete,
      rowIdField = 'id',
      isRowEditable,
      isRowDeletable,
      getEditableFields,
    },
    ref,
  ) => {
    const [internalData, setInternalData] = useState(data);
    const gridApiRef = useRef<any>(null);
    const internalDataRef = useRef(internalData);
    const onDataChangeRef = useRef(onDataChange);
    const onRowDeleteRef = useRef(onRowDelete);
    const editingRowDataRef = useRef<any>(null);
    const wasExplicitSaveRef = useRef<boolean>(false);

    // Optimistic updates: track changes that are being saved (edit only, not delete)
    const [optimisticUpdates, setOptimisticUpdates] = useState<
      Map<string, any>
    >(new Map());

    const computedInternalData = useMemo(() => {
      return data.map(row => {
        const rowId = String(row[rowIdField]);
        const optimisticUpdate = optimisticUpdates.get(rowId);
        return optimisticUpdate || row;
      });
    }, [data, optimisticUpdates, rowIdField]);

    // Update internal data when computed data changes
    useEffect(() => {
      setInternalData(computedInternalData);
    }, [computedInternalData]);

    // Clear optimistic updates when fresh data arrives from the API
    // Use a ref to track which rows have been updated by the server
    const prevDataRef = useRef<Map<string, any>>(new Map());

    useEffect(() => {
      // When fresh API data arrives for a row, clear its optimistic update
      // Only clear if the server data is different from what we had before
      setOptimisticUpdates(prev => {
        if (prev.size === 0) return prev;

        const newMap = new Map(prev);
        let hasChanges = false;

        data.forEach(row => {
          const rowId = String(row[rowIdField]);
          if (newMap.has(rowId)) {
            const optimisticRow = newMap.get(rowId);

            // Check if server returned data that's different from our optimistic update
            // This means the server processed our request and returned fresh data
            const serverHasNewData =
              row.updated_at !== optimisticRow?.updated_at ||
              row.updated_by !== optimisticRow?.updated_by;

            if (serverHasNewData) {
              newMap.delete(rowId);
              hasChanges = true;
            }
          }
          // Store current server data for next comparison
          prevDataRef.current.set(rowId, row);
        });

        return hasChanges ? newMap : prev;
      });
    }, [data, rowIdField]);

    // Update refs directly in render (doesn't cause re-renders)
    internalDataRef.current = internalData;
    onDataChangeRef.current = onDataChange;
    onRowDeleteRef.current = onRowDelete;

    useEffect(() => {
      const handleDeleteRow = async (event: any) => {
        const { id } = event.detail;
        let shouldDelete = true;

        if (onRowDeleteRef.current) {
          try {
            const result = await onRowDeleteRef.current(String(id));
            if (result === false) {
              shouldDelete = false;
            }
          } catch (err) {
            console.error('Failed to delete row:', err);
            shouldDelete = false;
          }
        }

        if (!shouldDelete) {
          return;
        }

        const newData = internalDataRef.current.filter(
          row => row[rowIdField] !== id,
        );
        setInternalData(newData);
        if (onDataChangeRef.current) {
          onDataChangeRef.current(newData, null);
        }
      };

      if (deleteRow) {
        window.addEventListener('deleteRow', handleDeleteRow as EventListener);
        return () => {
          window.removeEventListener(
            'deleteRow',
            handleDeleteRow as EventListener,
          );
        };
      }
    }, [deleteRow, rowIdField]);

    const columnDefs: ColDef[] = useMemo(() => {
      const agColumns: ColDef[] = columns.map(col => {
        const colDef: ColDef = {
          field: col.field,
          headerName: col.header,
          editable: params => {
            const columnEditable = col.editable || false;
            if (!columnEditable) return false;

            if (getEditableFields) {
              const editableFields = getEditableFields(params.data);
              if (editableFields !== undefined) {
                return editableFields.includes(col.field);
              }
            }

            if (isRowEditable) {
              return isRowEditable(params.data);
            }
            return true;
          },
          flex: col.flex,
          width: col.width,
          cellClass: col.editable ? 'editable-cell' : undefined,
          cellStyle: params => {
            return {
              display: 'flex',
              alignItems: 'center',
              height: '48px',
              paddingTop: '6px',
              paddingBottom: '4px',
              ...col.cellStyle,
            };
          },
        };

        // Handle cell editor based on type
        if (col.type === 'select' && col.selectOptions) {
          colDef.cellEditor = 'agSelectCellEditor';
          colDef.cellEditorParams = {
            values: col.selectOptions,
            valueListGap: 0,
          };
        } else if (col.type === 'tags') {
          colDef.cellRenderer = TagsCellRenderer;
        }

        if (col.cellRenderer) {
          colDef.cellRenderer = col.cellRenderer;
        }

        if (col.formatter) {
          colDef.valueFormatter = params => {
            return col.formatter!(params.value, params.data);
          };
        }

        return colDef;
      });

      // Add actions column if editRow or deleteRow is enabled
      // if (editRow || deleteRow) {
      //   // Find the first editable field
      //   const firstEditableCol = columns.find(col => col.editable);
      //   const firstField = firstEditableCol?.field || columns[0]?.field || '';

      //   const hasEditableFields = (rowData: any): boolean => {
      //     if (getEditableFields) {
      //       const editableFields = getEditableFields(rowData);
      //       if (editableFields !== undefined) {
      //         return editableFields.length > 0;
      //       }
      //     }
      //     if (isRowEditable) {
      //       return isRowEditable(rowData);
      //     }
      //     return columns.some(col => col.editable === true);
      //   };

      //   agColumns.push({
      //     field: 'actions',
      //     headerName: '',
      //     cellRenderer: createEditRowRenderer(
      //       editRow,
      //       deleteRow,
      //       firstField,
      //       rowIdField,
      //       hasEditableFields,
      //       isRowDeletable,
      //     ),
      //     cellEditor: editRow ? RowEditor : undefined,
      //     cellEditorParams: {
      //       rowIdField,
      //       onSave: (rowData: any) => {
      //         wasExplicitSaveRef.current = true;

      //         // Store optimistic update immediately for instant feedback
      //         const rowId = String(rowData[rowIdField]);
      //         setOptimisticUpdates(prev => new Map(prev).set(rowId, rowData));

      //         const newData = internalDataRef.current.map(row =>
      //           row[rowIdField] === rowData[rowIdField] ? rowData : row,
      //         );
      //         setInternalData(newData);
      //         if (onDataChangeRef.current) {
      //           const editingRowId = editingRowDataRef.current
      //             ? String(editingRowDataRef.current[rowIdField])
      //             : null;
      //           onDataChangeRef.current(newData, editingRowId);
      //         }
      //       },
      //     },
      //     editable: params => {
      //       if (!editRow) return false;
      //       return hasEditableFields(params.data);
      //     },
      //     width: 90,
      //     minWidth: 90,
      //     maxWidth: 90,
      //     sortable: false,
      //     filter: false,
      //     resizable: false,
      //     suppressMenu: true,
      //     suppressNavigable: true,
      //     suppressHeaderMenuButton: true,
      //     suppressKeyboardEvent: () => true,
      //     cellStyle: {
      //       backgroundColor: 'transparent',
      //       boxShadow: 'none',
      //       padding: '0',
      //       margin: '0',
      //       overflow: 'visible',
      //     },
      //   });
      // }

      return agColumns;
    }, [columns, isRowEditable, getEditableFields]);

    const shouldShowEmptyState = internalData.length === 0;

    const localeText = useMemo(
      () => ({
        noRowsToShow: '',
      }),
      [],
    );

    const renderedEmptyState = noRowsMessage ?? (
      <Text textStyle="R6" color="font-secondary">
        No data to show
      </Text>
    );

    const gridOptions: GridOptions = {
      columnDefs,
      rowData: internalData,
      getRowId: params => String(params.data[rowIdField]),
      editType: editRow ? 'fullRow' : undefined,
      rowSelection: 'single',
      defaultColDef: {
        sortable: true,
        filter: false,
        resizable: true,
        cellClass: editRow ? 'editable-cell' : undefined,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '8px',
          paddingRight: '8px',
        },
        suppressKeyboardEvent: params => {
          // Prevent Enter key from stopping edit mode
          if (params.editing && params.event.key === 'Enter') {
            return true; // suppress the event
          }
          return false;
        },
      },
      popupParent: document.querySelector('body'),
      rowHeight: 48,
      domLayout: 'autoHeight',
      suppressRowClickSelection: true,
      suppressColumnVirtualisation: true,
      suppressClickEdit: true,
      suppressRowTransform: true,
      stopEditingWhenCellsLoseFocus: false,
      localeText,
      onGridReady: event => {
        gridApiRef.current = event.api;
        // Set initial row data
        event.api.setGridOption('rowData', internalData);
      },
      onRowEditingStarted: event => {
        // Store the original row data before editing
        editingRowDataRef.current = { ...event.data };
        // Select the row being edited
        event.node.setSelected(true, true);
      },
      onRowEditingStopped: event => {
        // Clear selection first
        event.node.setSelected(false);
        event.api.deselectAll();

        // If it was an explicit save, data was already updated in onSave callback
        if (wasExplicitSaveRef.current) {
          wasExplicitSaveRef.current = false;
          editingRowDataRef.current = null;
          return;
        }

        // If editing was cancelled (clicked elsewhere), restore original data
        if (editingRowDataRef.current) {
          // Restore the original row data
          const newData = internalDataRef.current.map(row =>
            row[rowIdField] === editingRowDataRef.current[rowIdField]
              ? editingRowDataRef.current
              : row,
          );
          setInternalData(newData);
          editingRowDataRef.current = null;
        }
      },
    };
    // Update grid data when internalData changes
    useEffect(() => {
      if (gridApiRef.current) {
        gridApiRef.current.setGridOption('rowData', internalData);
      }
    }, [internalData]);

    // Handle add new row
    const handleAddRow = (newRow: any) => {
      if (!newRow) {
        return;
      }

      // Update internal data using functional update to get latest state
      setInternalData(prevData => {
        const updatedData = [...prevData, newRow];

        if (onDataChange) {
          onDataChange(updatedData, null);
        }

        // Start editing the new row using its ID after the grid updates
        setTimeout(() => {
          if (gridApiRef.current) {
            // Find the first editable field
            const firstEditableCol = columns.find(col => col.editable);
            const firstField = firstEditableCol?.field;

            if (firstField) {
              // Find the row node by ID
              const rowNode = gridApiRef.current.getRowNode(
                String(newRow[rowIdField]),
              );
              if (rowNode) {
                const rowIndex = rowNode.rowIndex;
                gridApiRef.current.setFocusedCell(rowIndex, firstField);
                gridApiRef.current.startEditingCell({
                  rowIndex,
                  colKey: firstField,
                });
              }
            }
          }
        }, 150);

        return updatedData;
      });
    };

    // Handle starting edit for a specific row
    const handleStartEditingRow = useCallback(
      (rowId: string) => {
        if (!gridApiRef.current) return;

        // Find the row node by ID
        const rowNode = gridApiRef.current.getRowNode(rowId);
        if (!rowNode) return;

        const rowIndex = rowNode.rowIndex;
        if (rowIndex === null || rowIndex === undefined) return;

        // Find the first editable field
        const firstEditableCol = columns.find(col => {
          if (!col.editable) return false;

          // Check if the field is editable for this specific row
          if (getEditableFields) {
            const editableFields = getEditableFields(rowNode.data);
            if (editableFields !== undefined) {
              return editableFields.includes(col.field);
            }
          }

          if (isRowEditable) {
            return isRowEditable(rowNode.data);
          }

          return true;
        });

        const firstField = firstEditableCol?.field;
        if (!firstField) return;

        // Start editing the row
        setTimeout(() => {
          if (gridApiRef.current) {
            gridApiRef.current.setFocusedCell(rowIndex, firstField);
            gridApiRef.current.startEditingCell({
              rowIndex,
              colKey: firstField,
            });
          }
        }, 100);
      },
      [columns, getEditableFields, isRowEditable],
    );

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      addRow: handleAddRow,
      startEditingRow: handleStartEditingRow,
    }));

    return (
      <Box
        width="100%"
        minHeight={shouldShowEmptyState ? '30vh' : undefined}
        position="relative"
      >
        <ExTable
          gridOptions={gridOptions}
          editableContent={editRow}
          overflowVisible
        />
        {shouldShowEmptyState && (
          <Box
            position="absolute"
            top="48px"
            left={0}
            width="100%"
            height="calc(100% - 48px)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={6}
            zIndex={1}
            backgroundColor="white"
          >
            {renderedEmptyState}
          </Box>
        )}
      </Box>
    );
  },
);

RiveryExoTable.displayName = 'RiveryExoTable';

export default RiveryExoTable;
