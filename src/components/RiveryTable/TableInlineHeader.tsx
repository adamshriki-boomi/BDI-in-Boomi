import { Divider } from '@chakra-ui/react';
import { Box, Flex, Grid, RenderGuard } from 'components';
import * as React from 'react';
import { Fragment, ReactNode } from 'react';
import { TableFilter } from './TableFilter';

type TableInlineHeaderProps = {
  headers: any[];
  onFilterChange: (...rest: any) => any;
  filter: any;
  children: React.ReactNode;
  showDefaultFilter?: boolean;
  filterLabel?: string;
  filterInputProps?: Record<string, any>;
  clearFilters?: ReactNode;
  entityType?: string;
};

const headerFilterWidth = 250;
function calcFiltersTemplateColumn(filtersLength) {
  if (filtersLength === 1) {
    return '300px';
  }
  return filtersLength > 5 ? '2fr' : `${filtersLength * headerFilterWidth}px`;
}

export const TableInlineHeader = React.memo(InlineHeader);
function InlineHeader({
  headers,
  onFilterChange,
  filter,
  children,
  showDefaultFilter = true,
  filterLabel = null,
  filterInputProps = null,
  clearFilters = null,
  entityType,
}: TableInlineHeaderProps) {
  const filterInputs = headers?.filter(
    ({ canFilter, Filter }) => canFilter && Filter,
  );
  return (
    <Flex pb={2} gap={2} flexDir="column">
      <Grid
        templateColumns={`${calcFiltersTemplateColumn(
          filterInputs?.length + Number(Boolean(clearFilters)) + 1,
        )} min-content`}
        alignItems={filterLabel ? 'end' : 'center'}
        justifyContent="space-between"
        overflowX="auto"
      >
        <Grid
          maxW="1500px"
          templateColumns="1fr min-content"
          alignItems={filterLabel ? 'end' : 'center'}
          {...(filterInputs?.length > 1 && { minW: '1300px' })}
        >
          <Grid
            w="100%"
            templateColumns="repeat(auto-fit, minmax(120px, 1fr))"
            gap={2}
            alignItems="center"
          >
            {showDefaultFilter ? (
              <TableFilter
                onFilterChange={onFilterChange}
                value={filter}
                chakra
                label={filterLabel}
                maxW="unset"
                minW="unset"
                {...(entityType === 'Data Flows' && {
                  name: `search-${entityType}`,
                })}
                {...filterInputProps}
              />
            ) : null}
            {filterInputs?.map(header => (
              <Fragment key={header.id}>{header.render('Filter')}</Fragment>
            ))}
          </Grid>
          <Box pl={2}>{clearFilters}</Box>
        </Grid>
        <Flex ml="auto">{children}</Flex>
      </Grid>
      <RenderGuard condition={showDefaultFilter}>
        <Divider orientation="horizontal" w="100%" bg="gray.300" />
      </RenderGuard>
    </Flex>
  );
}
