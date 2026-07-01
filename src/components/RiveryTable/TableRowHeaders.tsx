import { Flex, Icon } from '@chakra-ui/react';
import { Sort, SortDown, SortUp } from 'components/Icons';

type TableRowHeaderProps = {
  header: any;
  index: number;
  isCustom: boolean;
  displayTotalShowing: boolean;
};
type TableRowHeadersProps = {
  id: string;
  headers: any;
} & Pick<TableRowHeaderProps, 'isCustom' | 'displayTotalShowing'>;
export function TableRowHeaders({
  id,
  headers,
  ...props
}: TableRowHeadersProps) {
  return headers?.length > 0
    ? headers?.map((header, headerIndex) => (
        <TableRowHeader
          key={`table-header-${id}-${headerIndex}-${header.id}`}
          header={header}
          index={headerIndex}
          {...props}
        />
      ))
    : null;
}

const tableRowHeaderStyle = {
  bg: 'background',
  borderBottom: '1px solid',
  borderBottomColor: 'background-action',
  px: 2,
  py: 1,
  whiteSpace: 'nowrap',
  fontWeight: 600,
  color: 'font',
};

function TableRowHeader({
  header,
  isCustom,
  displayTotalShowing,
  index,
}: TableRowHeaderProps) {
  const sortProps =
    header.sortBy && header.canSort && displayTotalShowing
      ? header.getSortByToggleProps()
      : undefined;
  const { key, ...headerProps } = header.getHeaderProps();
  return (
    <Flex
      key={key}
      {...headerProps}
      {...sortProps}
      alignItems="center"
      position="sticky"
      top={0}
      zIndex={1}
      {...(!isCustom && tableRowHeaderStyle)}
      {...header.headerProps}
      userSelect="none"
      data-firstinrow={!index}
    >
      {header.render('Header')}
      {sortProps ? <SortIndicator header={header} /> : null}
    </Flex>
  );
}

function SortIndicator({ header }) {
  if (header.sortBy && header.canSort) {
    return header.isSorted ? (
      header.isSortedDesc ? (
        <Icon as={SortDown} boxSize={3} ml="6px" />
      ) : (
        <Icon as={SortUp} boxSize={3} ml="6px" />
      )
    ) : (
      <Sort className="show-on-parent-hover" />
    );
  } else {
    return null;
  }
}
