import { RiveryButton, RiveryOverlay, Text } from 'components';
import { IReport, IReportRow, ITable } from 'modules/SourceTarget/store';
import { useIsTableSelected } from '../rows.state.api';
import { ITableRow } from './TableCells';

export function TableName(table: ITableRow<ITable> | IReportRow<IReport>) {
  const { visibleName, isSelected } = useIsTableSelected(table);

  return isSelected ? (
    <RiveryButton
      label={visibleName}
      variant="link"
      alignItems="center"
      justifyContent="start"
      fontWeight="medium"
      size="sm"
      onClick={() => table.column.getProps.openDrawer(table)}
      h="30px"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
      overflow="hidden"
      tooltip={visibleName}
      tooltipProps={{ placement: 'right' }}
      pl={0}
      name={visibleName}
    />
  ) : (
    <RiveryOverlay description={visibleName} placement="right">
      <Text
        fontWeight="medium"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        overflow="hidden"
      >
        {visibleName}
      </Text>
    </RiveryOverlay>
  );
}
