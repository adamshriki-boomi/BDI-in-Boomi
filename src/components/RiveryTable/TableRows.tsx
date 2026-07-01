import { HStack } from '@chakra-ui/react';
import clsx from 'clsx';
import { Box } from 'components';
import * as React from 'react';

type TableRowsProps = {
  id: string;
  rows: any[];
  prepareRow: any;
  onRowClick: () => any;
  isRowSelected: (...rest: any) => boolean;
  isRowDisabled: (...rest: any) => boolean;
  isCustomPadding: boolean;
  markFirstRow?: boolean;
};

export const TableRows = React.memo(RiveryTableRows);
export function RiveryTableRows({
  id,
  rows,
  prepareRow,
  onRowClick,
  isRowSelected,
  isRowDisabled,
  isCustomPadding,
  markFirstRow = false,
  useIdAsIndex,
}: TableRowsProps & { useIdAsIndex: boolean }) {
  return rows.length > 0 ? (
    <>
      {rows?.map(row => {
        prepareRow(row);
        return (
          <TableRow
            id={id}
            row={row}
            key={`table-row-${id}-${row?.id}`}
            onRowClick={onRowClick}
            isRowSelected={isRowSelected}
            isRowDisabled={isRowDisabled}
            isCustomPadding={isCustomPadding}
            markFirstRow={markFirstRow}
            useIdAsIndex={useIdAsIndex}
          />
        );
      })}
    </>
  ) : null;
}

type TableRowProps = {
  id;
  row: any;
  onRowClick: () => any;
  isRowSelected: (...rest: any) => boolean;
  isRowDisabled: (...rest: any) => boolean;
  isCustomPadding: boolean;
  markFirstRow: boolean;
};

export function TableRow({
  id,
  row,
  onRowClick,
  isRowSelected,
  isRowDisabled,
  isCustomPadding,
  markFirstRow,
  useIdAsIndex,
}: TableRowProps & { useIdAsIndex: boolean }) {
  const isSelected = isRowSelected && isRowSelected(row.original);
  const isDisabled = isRowDisabled && isRowDisabled(row.original);
  return (
    <RowWrapper
      row={row}
      isSelected={isSelected}
      onRowClick={onRowClick}
      markFirstRow={markFirstRow}
    >
      {row?.cells.map((cell, cellIndex) => {
        const isMarkedFirstRow = markFirstRow && row.index === 0;
        const indexValue =
          cell?.value?.['value'] !== undefined ? cell.value.value : cell.value;
        return (
          <RowCell
            key={`row-cell-${useIdAsIndex ? id : indexValue}-${cellIndex}`}
            cell={cell}
            actionable={Boolean(onRowClick || isSelected)}
            disabled={isDisabled}
            isCustomPadding={isCustomPadding}
            index={cellIndex}
            markFirstRow={isMarkedFirstRow}
          />
        );
      })}
    </RowWrapper>
  );
}

function RowCell({
  cell,
  index,
  actionable,
  disabled,
  isCustomPadding,
  markFirstRow,
}) {
  const hasCustomWrapper = Boolean(cell?.column?.CellWrapper);
  const CellWrapper = hasCustomWrapper ? cell.column.CellWrapper : HStack;
  const { key, ...cellProps } = cell.getCellProps({
    ...cell.column.styleProps,
    className: clsx(disabled && 'disabled-row', cell.column.className),
  });

  return (
    <CellWrapper
      bg={actionable ? null : 'white'}
      p={!isCustomPadding && 2}
      cell={hasCustomWrapper ? cell : null}
      key={key}
      {...cellProps}
      data-firstinrow={!index}
      {...(markFirstRow && { position: 'sticky', top: 9, zIndex: 1 })}
    >
      {cell.render('Cell')}
    </CellWrapper>
  );
}
function RowWrapper({ row, isSelected, onRowClick, markFirstRow, children }) {
  const isMarkedFirstRow = markFirstRow && row.index === 0;
  const { key, ...rowProps } = row.getRowProps({});
  return (
    <Box
      color="font"
      display="contents"
      _hover={{
        '& > div': {
          bg: !isMarkedFirstRow && 'background-secondary',
        },
      }}
      sx={{
        '& > div': {
          bgColor:
            isMarkedFirstRow || isSelected
              ? 'background-selected-weak'
              : 'background',
          // : parseInt(key.split('_')[1]) % 2 === 0
          // ? 'background'
          // : 'rgba(245, 245, 245, 0.50)',
          borderBottom:
            isMarkedFirstRow && '2px solid var(--chakra-colors-purple-400)',
        },
      }}
      key={key}
      {...rowProps}
      onClick={() => (onRowClick ? onRowClick(row.original) : void 0)}
    >
      {children}
    </Box>
  );
}
