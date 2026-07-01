import { Grid, IconButton } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'components';
import { useMainFormColumnsDefinitions } from 'modules/SourceTarget/components/form';
import { useCallback, useEffect, useState } from 'react';
import { compareNumericItems } from 'utils/array.utils';
import { useCombinedColumns } from '../hooks/useCombinedColumns';
import { useModifiedColumns } from '../hooks/useModifiedColumns';
import { ItemList } from './MatchKeyEditor/ItemList';
import { columns, matchKeyColumns } from './MatchKeyEditor/matchKey.columns';
import { useEnhancedColumns } from './MatchKeyEditor/useEnhancedColumns';
import { SearchData } from './SearchData';

export function SortEditor({ isDisabled, setSelected }) {
  const { isPredefined } = useMainFormColumnsDefinitions();
  const api = useModifiedColumns();
  const [filterExpression, filterBy] = useState(null);
  const { withSort, withoutSort } = useDataBuilder(api, filterExpression);

  const {
    state: unsorted,
    clear: clearUnsorted,
    onSelect: onSelectSorted,
    onUnselect: onUnselectSorted,
  } = useEnhancedColumns(columns, api);
  const {
    state: sorted,
    clear: clearSorted,
    onSelect,
    onUnselect,
  } = useEnhancedColumns(matchKeyColumns, { ...api });

  const onMove = (keys: string[]) => {
    api.updateSortOrderMany(keys, withSort.length + 1);
    clearUnsorted();
  };

  const onMoveBack = (keys: string[]) => {
    api.updateMany(keys, { sort_order: null });
    clearSorted();
  };

  useEffect(
    () => setSelected({ Sort: Boolean(withSort.length) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [withSort.length],
  );

  return (
    <Grid
      gridTemplateRows="auto 1fr"
      gap="4"
      as="fieldset"
      display="grid"
      disabled={isDisabled}
    >
      <Grid gap="4" alignItems="center" gridTemplateColumns="max-content auto">
        <SearchData onFilterColumns={filterBy} isPredefined={isPredefined} />
      </Grid>
      <Grid gap="4" gridTemplateColumns={`1fr auto 1fr`} overflow="hidden">
        <ItemList
          items={withoutSort}
          header="Choose Columns to move to Sort"
          checked={unsorted}
          onSelect={onSelectSorted}
          onUnselect={onUnselectSorted}
          showIndex
          indexColumnWidth="44px"
        />
        <Grid alignItems="center" alignContent="center" gap="4">
          <IconButton
            icon={<ChevronRight />}
            aria-label={`move to arranged`}
            borderRadius="full"
            bgColor="gray.200"
            onClick={() => {
              onMove(unsorted);
            }}
          />
          <IconButton
            icon={<ChevronLeft />}
            aria-label={`move back to not arranged`}
            borderRadius="full"
            bgColor="gray.200"
            onClick={() => {
              onMoveBack(sorted);
            }}
          />
        </Grid>
        <ItemList
          items={withSort}
          header="Arrange Columns in the order of loading to Sort"
          indexHeader="Sort"
          checked={sorted}
          onSelect={onSelect}
          onUnselect={onUnselect}
          onSortChange={api.updateSortOrderByIndex}
          draggable
          showIndex
          indexColumnWidth="65px"
        />
      </Grid>
    </Grid>
  );
}

const useDataBuilder = (
  api: ReturnType<typeof useModifiedColumns>,
  filterExpression,
) => {
  const [, withSortColumns, withoutSort] = useCombinedColumns(
    api.modifiedColumnsMap,
    'sort_order',
    null,
  );

  const withSort = withSortColumns?.sort((a: any, b: any) =>
    compareNumericItems(a?.sort_order, b?.sort_order),
  );
  const filteredResult = useCallback(
    arr =>
      filterExpression
        ? arr.filter(({ name }) => name.includes(filterExpression))
        : arr,
    [filterExpression],
  );
  return {
    withSort: filteredResult(withSort),
    withoutSort: filteredResult(withoutSort),
  };
};
