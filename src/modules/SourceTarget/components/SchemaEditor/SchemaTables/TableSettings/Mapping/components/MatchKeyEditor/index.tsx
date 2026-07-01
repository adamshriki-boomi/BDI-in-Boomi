import { Grid, IconButton } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'components';
import { useMainFormColumnsDefinitions } from 'modules/SourceTarget/components/form';
import { useEffect, useState } from 'react';
import { useCombinedColumns } from '../../hooks/useCombinedColumns';
import { useModifiedColumns } from '../../hooks/useModifiedColumns';
import { SearchData } from '../SearchData';
import { ItemList } from './ItemList';
import { columns, matchKeyColumns } from './matchKey.columns';
import { useEnhancedColumns } from './useEnhancedColumns';

export function MatchKeyEditor({ isDisabled, setSelected = null }) {
  const { isPredefined } = useMainFormColumnsDefinitions();
  const [filterExpression, filterBy] = useState(null);
  const api = useModifiedColumns();
  const [, withKey, withoutKey] = useCombinedColumns(
    api.modifiedColumnsMap,
    'is_key',
    filterExpression,
  );

  const {
    state: noKeyValue,
    clear: clearWithoutKey,
    onSelect: onSelectSorted,
    onUnselect: onUnselectSorted,
  } = useEnhancedColumns(columns, api);
  const {
    state: keyValue,
    clear: clearWithKey,
    onSelect,
    onUnselect,
  } = useEnhancedColumns(matchKeyColumns, { ...api });

  const onMove = (keys: string[], is_key: boolean) => {
    api.updateMany(keys, { is_key });
    clearWithKey();
    clearWithoutKey();
  };
  useEffect(
    () => setSelected({ 'Match Key': Boolean(withKey.length) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [withKey.length],
  );

  return (
    <Grid
      as="fieldset"
      display="grid"
      disabled={isDisabled}
      gridTemplateRows="auto 1fr"
      gap="4"
      h="full"
      overflow="hidden"
    >
      <Grid gap="4" alignItems="center" gridTemplateColumns="max-content auto">
        <SearchData onFilterColumns={filterBy} isPredefined={isPredefined} />
      </Grid>
      <Grid gap="4" gridTemplateColumns={`1fr auto 1fr`} overflow="hidden">
        <ItemList
          items={withoutKey}
          header="Choose Columns to move to Match Key"
          checked={noKeyValue}
          onSelect={onSelectSorted}
          onUnselect={onUnselectSorted}
          showIndex
          indexColumnWidth="44px"
        />
        <Grid alignItems="center" alignContent="center" gap="4">
          <IconButton
            bg="transparent"
            icon={<ChevronRight />}
            aria-label={`move to match key`}
            borderRadius="full"
            onClick={() => {
              onMove(noKeyValue, true);
            }}
          />
          <IconButton
            bg="transparent"
            icon={<ChevronLeft />}
            aria-label={`move key back`}
            borderRadius="full"
            onClick={() => {
              onMove(keyValue, false);
            }}
          />
        </Grid>
        <ItemList
          items={withKey}
          header="Match Key Columns"
          checked={keyValue}
          onSelect={onSelect}
          onUnselect={onUnselect}
          showKey
        />
      </Grid>
    </Grid>
  );
}
