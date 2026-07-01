import { CellStyle, ICellRendererParams } from 'ag-grid-community';
import { ReactNode } from 'react';

export interface RiveryColumn {
  field: string;
  header: string;
  editable?: boolean;
  type?: 'text' | 'select' | 'tags' | 'number';
  selectOptions?: string[];
  flex?: number;
  width?: number;
  formatter?: (value: any, row: any) => string;
  validate?: (value: any, row: any) => boolean;
  cellStyle?: CellStyle;
  /** Custom cell renderer - can return ReactNode or HTMLElement for ag-grid compatibility */
  cellRenderer?: (params: ICellRendererParams) => ReactNode | HTMLElement;
}

export interface RiveryExoTableProps {
  columns: RiveryColumn[];
  data: any[];
  editRow?: boolean;
  deleteRow?: boolean;
  /**
   * Custom empty-state content. Strings render via ag-grid locale text,
   * React nodes render as an overlay above the grid body (headers remain visible).
   */
  noRowsMessage?: ReactNode;
  onDataChange?: (newData: any[], editingRowId?: string | null) => void;
  onRowDelete?: (rowId: string) => Promise<boolean | void> | boolean | void;
  rowIdField?: string;
  isRowEditable?: (row: any) => boolean;
  isRowDeletable?: (row: any) => boolean;
  /**
   * Returns a list of editable field names for a given row.
   * If undefined, falls back to column-level editable configuration.
   * If an empty array is returned, no fields are editable for that row.
   */
  getEditableFields?: (row: any) => string[] | undefined;
}

export interface RiveryExoTableRef {
  addRow: (newRow: any) => void;
  startEditingRow: (rowId: string) => void;
}
