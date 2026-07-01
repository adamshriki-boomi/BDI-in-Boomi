import { ICellRendererParams } from 'ag-grid-community';
import {
  createTableActionsMenuRenderer,
  MenuOption,
} from 'components/Exosphere/ExoTable/TableActionsMenu';
import { SettingsNotificationsTags } from 'utils/tracking.tags';

/**
 * Creates a cell renderer for the notification actions column.
 * This is a React component that works with ag-grid's cellRenderer.
//  */

export const createNotificationActionsRenderer = (
  onEdit: (rowData: any) => void,
  onDelete: (rowId: string) => void,
  rowIdField: string = 'id',
) => {
  return (params: ICellRendererParams) => {
    const isPreset = params.data?.isPreset === true;

    // Define menu options
    const menuOptions: MenuOption[] = [
      {
        label: 'Edit',
        icon: 'Edit',
        onClick: () => onEdit(params.data),
        pendoId: SettingsNotificationsTags.ROW_EDIT_ACTION,
      },
    ];

    if (!isPreset) {
      menuOptions.push({
        label: 'Delete',
        icon: 'Delete',
        onClick: () => onDelete(params.data[rowIdField]),
        pendoId: SettingsNotificationsTags.ROW_DELETE_ACTION,
      });
    }

    // Use the generic table actions menu renderer
    const renderer = createTableActionsMenuRenderer({
      options: menuOptions,
      menuWidth: 160,
      triggerPendoId: SettingsNotificationsTags.ROW_ACTIONS_MENU,
    });

    return renderer(params);
  };
};
