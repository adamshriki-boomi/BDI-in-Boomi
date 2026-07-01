import { Grid, IconButton } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'components';
import { useCallback, useEffect, useState } from 'react';
import { compareNumericItems } from 'utils/array.utils';
import { SearchData } from './SearchData';
import { ItemList } from './MatchKeyEditor/ItemList';
import { columns, matchKeyColumns } from './MatchKeyEditor/matchKey.columns';
import { useEnhancedColumns } from './MatchKeyEditor/useEnhancedColumns';
import { useCombinedColumns } from '../hooks/useCombinedColumns';
import { useModifiedColumns } from '../hooks/useModifiedColumns';
import { useToastComponent } from 'hooks/useToast';
import { useMainFormColumnsDefinitions } from 'modules/SourceTarget/components/form';

export function ClusterEditor({
  isDisabled,
  maxAllowed = Infinity,
  setSelected,
}) {
  const { isPredefined } = useMainFormColumnsDefinitions();
  const { error } = useToastComponent();
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
    api.updateClusterKeyMany(keys, withSort.length + 1);
    clearUnsorted();
  };

  const onMoveBack = (keys: string[]) => {
    api.updateMany(keys, { cluster_key: null });
    clearSorted();
  };

  useEffect(
    () => setSelected({ Cluster: Boolean(withSort.length) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [withSort.length],
  );

  const disableSelection =
    withSort?.length + unsorted?.length + sorted?.length > maxAllowed;

  return (
    <Grid
      gridTemplateRows="auto 1fr"
      gap="4"
      as="fieldset"
      display="grid"
      disabled={isDisabled}
      h="full"
      overflow="hidden"
    >
      <Grid gap="4" alignItems="center" gridTemplateColumns="max-content auto">
        <SearchData onFilterColumns={filterBy} isPredefined={isPredefined} />
      </Grid>
      <Grid gap="4" gridTemplateColumns={`1fr auto 1fr`} overflow="hidden">
        <ItemList
          items={withoutSort}
          header="Choose Columns to move to Cluster"
          checked={unsorted}
          onSelect={name => {
            if (unsorted?.length + sorted?.length === maxAllowed) {
              error({
                description: 'You can select up to 4 columns as cluster keys',
                duration: 10000,
              });
            }
            onSelectSorted(name);
          }}
          onUnselect={onUnselectSorted}
          showIndex
          indexColumnWidth="44px"
        />
        <Grid alignItems="center" alignContent="center" gap="4">
          <IconButton
            bg="transparent"
            icon={<ChevronRight />}
            aria-label={`move to arranged`}
            borderRadius="full"
            onClick={() => {
              onMove(unsorted);
            }}
            isDisabled={disableSelection}
          />
          <IconButton
            bg="transparent"
            icon={<ChevronLeft />}
            aria-label={`move back to not arranged`}
            borderRadius="full"
            onClick={() => {
              onMoveBack(sorted);
            }}
          />
        </Grid>
        <ItemList
          items={withSort}
          header="Arrange Columns in the order of loading to Cluster"
          indexHeader="Cluster"
          checked={sorted}
          onSelect={onSelect}
          onUnselect={onUnselect}
          onSortChange={api.updateClusterKeyByIndex}
          draggable
          showIndex
          indexColumnWidth="68px"
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
    'cluster_key',
    null,
  );

  const withSort = withSortColumns?.sort((a: any, b: any) =>
    compareNumericItems(a?.cluster_key, b?.cluster_key),
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
