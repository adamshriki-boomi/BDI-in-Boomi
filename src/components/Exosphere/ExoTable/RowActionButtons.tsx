import {
  ICellRendererParams,
  ICellEditorComp,
  ICellEditorParams,
} from 'ag-grid-community';

const CANCEL_BUTTON_HTML = `
  <ex-icon-button
    class="btn-cancel"
    icon="Close"
    type="secondary"
    size="default"
    flavor="base"
    label="Cancel"
  ></ex-icon-button>
`;

const SAVE_BUTTON_HTML = `
  <ex-icon-button
    class="btn-save"
    icon="Check"
    type="primary"
    size="default"
    flavor="base"
    label="Save"
  ></ex-icon-button>
`;

const EDIT_BUTTON_HTML = `
  <ex-icon-button
    class="btn-edit"
    icon="Edit"
    type="secondary"
    size="default"
    flavor="base"
    label="Edit"
  ></ex-icon-button>
`;

const DELETE_BUTTON_HTML = `
  <ex-icon-button
    class="btn-delete"
    icon="Delete"
    type="primary"
    size="default"
    flavor="risky"
    label="Delete"
  ></ex-icon-button>
`;

const BUTTONS_WRAPPER_STYLE =
  'display: flex; align-items: center; padding-top: 2px; float: right; gap: 8px;';

const NEW_ROW_BUTTONS_HTML = `
  <span style="${BUTTONS_WRAPPER_STYLE}">
    ${CANCEL_BUTTON_HTML}
    ${SAVE_BUTTON_HTML}
  </span>
`;

// Renderer for Edit/Delete buttons (or Save/Cancel for new rows)
export const createEditRowRenderer = (
  showEdit: boolean,
  showDelete: boolean,
  firstField: string,
  rowIdField: string,
  isRowEditable?: (row: any) => boolean,
  isRowDeletable?: (row: any) => boolean,
  validateRow?: (row: any) => boolean,
  onSave?: (rowData: any) => void,
) => {
  return (params: ICellRendererParams) => {
    const container = document.createElement('div');
    const isNewRow = params.data?.isNew === true;

    // For new rows, show Save/Cancel buttons immediately
    if (isNewRow) {
      container.innerHTML = NEW_ROW_BUTTONS_HTML;

      const btnSave = container.querySelector('.btn-save') as HTMLElement;
      const btnCancel = container.querySelector('.btn-cancel');

      // Update save button state based on validation
      const updateSaveState = () => {
        const isValid = validateRow ? validateRow(params.data) : true;
        if (btnSave) {
          (btnSave as any).disabled = !isValid;
          btnSave.style.opacity = isValid ? '1' : '0.5';
          btnSave.style.cursor = isValid ? 'pointer' : 'not-allowed';
        }
      };
      updateSaveState();

      // Save handler - start editing first to collect values, then save
      btnSave?.addEventListener('click', () => {
        // Start editing to enable the full row edit mode with proper save
        params.api.setFocusedCell(params.node.rowIndex!, firstField);
        params.api.startEditingCell({
          rowIndex: params.node.rowIndex!,
          colKey: firstField,
        });
      });

      // Cancel handler - delete the new row
      btnCancel?.addEventListener('click', () => {
        window.dispatchEvent(
          new CustomEvent('deleteRow', {
            detail: { id: params.data[rowIdField] },
          }),
        );
      });

      return container;
    }

    // For existing rows, show Edit/Delete buttons
    const canEdit = showEdit && (!isRowEditable || isRowEditable(params.data));
    const canDelete =
      showDelete && (!isRowDeletable || isRowDeletable(params.data));

    let buttonsHtml = '';
    if (canEdit) {
      buttonsHtml += EDIT_BUTTON_HTML;
    }
    if (canDelete) {
      buttonsHtml += DELETE_BUTTON_HTML;
    }

    container.innerHTML = `
      <span style="${BUTTONS_WRAPPER_STYLE}">
        ${buttonsHtml}
      </span>
    `;

    // Add event listeners after innerHTML is set
    if (canEdit) {
      const editBtn = container.querySelector('.btn-edit');
      editBtn?.addEventListener('click', () => {
        params.api.setFocusedCell(params.node.rowIndex!, firstField);
        params.api.startEditingCell({
          rowIndex: params.node.rowIndex!,
          colKey: firstField,
        });
      });
    }

    if (canDelete) {
      const deleteBtn = container.querySelector('.btn-delete');
      deleteBtn?.addEventListener('click', () => {
        window.dispatchEvent(
          new CustomEvent('deleteRow', {
            detail: { id: params.data[rowIdField] },
          }),
        );
      });
    }

    return container;
  };
};

// Editor for Save/Cancel buttons
export class RowEditor implements ICellEditorComp {
  eInput!: HTMLDivElement;
  params!: ICellEditorParams;
  colState: any;
  btnSave: any;
  btnCancel: any;
  handleSave!: () => void;
  handleCancel!: () => void;
  handleCellValueChanged!: (event: any) => void;
  validateRow!: (rowData: any) => boolean;
  rowIdField: string = 'id';

  init(params: ICellEditorParams) {
    this.params = params;
    this.eInput = document.createElement('div');
    this.colState = params.api!.getColumnState();

    // Get validation function and rowIdField from params
    this.validateRow = (params as any).validateRow || (() => true);
    this.rowIdField = (params as any).rowIdField || 'id';

    this.eInput.innerHTML = NEW_ROW_BUTTONS_HTML;

    // Get button references
    this.btnSave = this.eInput.querySelector('.btn-save');
    this.btnCancel = this.eInput.querySelector('.btn-cancel');

    // Check initial validation state
    this.updateSaveButtonState();

    // Create event handlers
    this.handleSave = () => {
      // Get current editing values before validation
      const currentData = { ...params.data };
      const allColumns = params.api.getColumnDefs();

      if (allColumns) {
        allColumns.forEach((colDef: any) => {
          if (colDef.field && colDef.field !== 'actions') {
            const cellEditorInstance = params.api.getCellEditorInstances({
              rowNodes: [params.node],
              columns: [colDef.field],
            })[0];

            if (cellEditorInstance && cellEditorInstance.getValue) {
              currentData[colDef.field] = cellEditorInstance.getValue();
            }
          }
        });
      }

      if (this.validateRow(currentData)) {
        // Call onSave callback if provided
        const onSave = (params as any).onSave;
        if (onSave) {
          onSave(currentData);
        }
        params.api.stopEditing();
        params.api!.applyColumnState({ state: this.colState });
      }
    };

    this.handleCancel = () => {
      // Check if this is a new row and if it's invalid
      const rowData = params.data;
      const isNewRow = rowData.isNew === true;
      const isValid = this.validateRow(rowData);

      // If it's a new row and it's invalid, delete it instead of just canceling
      if (isNewRow && !isValid) {
        params.api.stopEditing(true);
        // Dispatch delete event after a short delay to ensure edit mode is stopped
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('deleteRow', {
              detail: { id: rowData[this.rowIdField] },
            }),
          );
        }, 0);
      } else {
        // Normal cancel behavior - just stop editing and revert changes
        params.api.stopEditing(true);
      }
    };

    // Listen for cell value changes to update validation
    this.handleCellValueChanged = (event: any) => {
      if (event.node === params.node) {
        setTimeout(() => this.updateSaveButtonState(), 50);
      }
    };

    // Add event listeners
    this.btnSave.addEventListener('click', this.handleSave);
    this.btnCancel.addEventListener('click', this.handleCancel);
    params.api.addEventListener(
      'cellValueChanged',
      this.handleCellValueChanged,
    );

    // Also update validation periodically while editing
    const validationInterval = setInterval(() => {
      if (this.params.node && this.params.api) {
        this.updateSaveButtonState();
      }
    }, 300);

    // Store interval to clean up later
    (this as any).validationInterval = validationInterval;
  }

  updateSaveButtonState() {
    // Get current editing values from all cells
    const currentData = { ...this.params.data };
    const allColumns = this.params.api.getColumnDefs();

    if (allColumns) {
      allColumns.forEach((colDef: any) => {
        if (colDef.field && colDef.field !== 'actions') {
          const cellEditorInstance = this.params.api.getCellEditorInstances({
            rowNodes: [this.params.node],
            columns: [colDef.field],
          })[0];

          if (cellEditorInstance && cellEditorInstance.getValue) {
            currentData[colDef.field] = cellEditorInstance.getValue();
          }
        }
      });
    }

    const isValid = this.validateRow(currentData);
    if (this.btnSave) {
      this.btnSave.disabled = !isValid;
      this.btnSave.style.opacity = isValid ? '1' : '0.5';
      this.btnSave.style.cursor = isValid ? 'pointer' : 'not-allowed';
    }
  }

  getGui() {
    return this.eInput;
  }

  getValue() {
    return this.params;
  }

  refresh(params: ICellEditorParams) {
    this.params = params;
    this.updateSaveButtonState();
    return true;
  }

  destroy() {
    // Clean up event listeners
    if (this.btnSave) {
      this.btnSave.removeEventListener('click', this.handleSave);
    }
    if (this.btnCancel) {
      this.btnCancel.removeEventListener('click', this.handleCancel);
    }
    if (this.params.api && this.handleCellValueChanged) {
      this.params.api.removeEventListener(
        'cellValueChanged',
        this.handleCellValueChanged,
      );
    }
    // Clean up validation interval
    if ((this as any).validationInterval) {
      clearInterval((this as any).validationInterval);
    }
  }
}
