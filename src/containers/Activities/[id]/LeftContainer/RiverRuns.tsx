import {
  ActivitiesNoSearchResults,
  Box,
  DRAWER_PARAM_NAME,
  Flex,
  GridBox,
  HStack,
  Icon,
  IconButton,
  InfiniteScrollComponent,
  InfoTooltip,
  RiveryOverlay,
  Sort,
  SortDown,
  SortUp,
  Text,
} from 'components';
import { ResultsPanelInnerSpinner } from 'components/Loaders/Loader';
import { useParams } from 'containers/Activities/useFetchActivities';
import { getQueryParams, useReplaceQueryParams } from 'hooks/router';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { getTimeZone } from 'utils/date.utils';
import {
  hasRequiredParams,
  parseSearchParams,
  removeQueryParams,
} from 'utils/searchParams';
import { useRiverId } from '../../helpers';
import {
  activitiesApi,
  RiverActivitiesRun,
  useActivityPageType,
} from '../../store';
import {
  useRunParamPropName,
  useViewParamResolver,
} from '../components/ViewRadios';
import { HELPER_PARAMS } from '../params';

const sortOrder = ['desc', 'asc', null];
const SortIcon = {
  asc: SortUp,
  desc: SortDown,
};

function getSortOrder(current) {
  const index = sortOrder.indexOf(current);
  if (index === 2) {
    return sortOrder[0];
  }
  return sortOrder[index + 1];
}

export const gridTemplateColumns = (isRuns = true) =>
  isRuns ? '2fr 1fr 2fr 50px 70px' : '4fr 1fr 90px';

type ApiHook =
  | typeof activitiesApi.endpoints.getActivityRiverRuns.useQuery
  | typeof activitiesApi.endpoints.getActivitiesTargets.useQuery;
export interface LeftContainerProps<T> {
  useApiHook: ApiHook;
  rowComponent: React.FC<{ item: T; index: number }>;
  headers: {
    label: string;
    width?: string;
    /**
     * value is used as the name of prop to sort
     */
    sort?: string;
  }[];
}
const paramsToRemove = (isTablesView, shouldSortLeft) => [
  ...HELPER_PARAMS,
  DRAWER_PARAM_NAME,
  'is_scheduled',
  'search',
  'group_id',
  'river_type',
  'pageSize',
  'pageIndex',
  'river_drawer',
  'sortBy',
  'sortOrder',
  isTablesView ? 'sub_river_id' : '',
  !shouldSortLeft ? 'sortBy' : '',
  !shouldSortLeft ? 'sortOrder' : '',
];

const defaultState = { runs: [], total_items: 0, cache_context_id: null };

export function RiverRuns<T>({
  useApiHook,
  rowComponent: RowComponent,
  headers,
}: LeftContainerProps<T>) {
  const { api } = useParams();
  const [allRuns, setRuns] = useState(defaultState);
  const [page, setPage] = useState(1);
  const riverId = useRiverId();
  const { activityPageType, isLogicRiver } = useActivityPageType();
  const [sort, setSort] = useState({
    sort_by: null,
    sort_order: null,
  });
  const [shouldSortLeft, setShouldSort] = useState(false);
  const { isSubRivers } = useViewParamResolver();
  const location = useLocation();

  const params = parseSearchParams(
    removeQueryParams(
      {
        ...parseSearchParams(location.search),
        ...sort,
      },
      paramsToRemove(!isSubRivers, shouldSortLeft),
    ),
  );

  const {
    data: riverRuns,
    isLoading,
    isFetching,
  } = useApiHook(
    {
      ...params,
      riverId: `${riverId}`,
      page,
      ...(page !== 1 && { cache_context_id: allRuns?.cache_context_id }),
    },
    {
      skip:
        (page !== 1 && !Boolean(allRuns?.cache_context_id)) ||
        !hasRequiredParams(requiredParams, {
          ...params,
          riverId: `${riverId}`,
        }),
    },
  );
  const loading = isLoading || isFetching;

  const runPropName = useRunParamPropName();
  useEffectOnce(() => {
    if (!isSubRivers && !isLogicRiver) {
      api.setParam({ param: runPropName });
    }
  });

  //Monitoring if filters were changed, if so, we reset the page to 1 with the new filters
  const { start_time, end_time, status } = getQueryParams([
    'start_time',
    'end_time',
    'status',
  ]);
  useEffect(() => {
    setRuns(defaultState);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start_time, end_time, status?.length]);

  useEffect(() => {
    const token = riverRuns?.next_page;
    const cache_context_id = token
      ? token
          .substring(token.indexOf('cache_context_id'), token.length)
          .split('=')[1]
      : '';
    const contextIdChanged =
      cache_context_id === '' &&
      (riverRuns?.total_items !== allRuns.total_items ||
        cache_context_id !== allRuns.cache_context_id);
    if (
      page === 1 &&
      riverRuns?.items &&
      (contextIdChanged ||
        !Boolean(allRuns.runs?.length) ||
        riverRuns.items[0]?.run_group_id !== allRuns?.runs?.[0]?.run_group_id)
    ) {
      setRuns({
        cache_context_id,
        runs: riverRuns?.items,
        total_items: riverRuns?.total_items,
      });
    } else if (
      riverRuns?.page !== 1 &&
      riverRuns?.current_page_size + allRuns?.runs?.length <=
        riverRuns?.total_items
    ) {
      setRuns(state => {
        const currState = [...state?.runs];
        const runs = currState.concat(riverRuns.items);
        return { ...state, runs };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riverRuns]);

  const setQueryParams = useReplaceQueryParams();
  useEffect(() => {
    if (isLogicRiver && !loading && allRuns?.runs?.length === 0) {
      setQueryParams({ run: null });
    }
  }, [allRuns?.runs?.length, isLogicRiver, loading, setQueryParams]);

  const fetchMoreData = useCallback(
    () => riverRuns?.next_page && setPage(state => state + 1),
    [riverRuns?.next_page],
  );

  const { isTablesView } = useViewParamResolver();
  const sortBy = useCallback(
    (key, order) => {
      if (shouldSortLeft) {
        setPage(1);
        setRuns(defaultState);
        setSort({
          sort_by: !order ? null : key,
          sort_order: order,
        });
      }
    },
    [shouldSortLeft],
  );
  return (
    <>
      <GridBox
        w="full"
        px={4}
        alignItems="center"
        templateColumns={gridTemplateColumns(!isTablesView)}
        height="40px"
        borderRadius="0"
        bg="background"
        borderBottom="1px solid"
        borderBottomColor="background-action"
        fontWeight="medium"
        whiteSpace="nowrap"
        overflow="hidden"
      >
        {headers.map(header => (
          <Flex
            whiteSpace="nowrap"
            minW={header.width ?? 'unset'}
            alignItems="center"
            key={`headers-${header.label}`}
          >
            <ColumnNameWrap showTooltip={header.label === 'Run Time'}>
              <Text noOfLines={1}>{header.label}</Text>
            </ColumnNameWrap>
            {header.sort ? (
              <SortButton
                type={header.sort}
                sort={sort}
                sortBy={sortBy}
                setShouldSort={setShouldSort}
              />
            ) : null}
          </Flex>
        ))}
      </GridBox>
      <Box>
        {loading ? (
          <Flex h="full">
            <ResultsPanelInnerSpinner />
          </Flex>
        ) : null}
        {allRuns?.runs?.length === 0 ? (
          <ActivitiesNoSearchResults />
        ) : (
          <InfiniteScrollComponent
            fetchMoreData={fetchMoreData}
            ariaLabel={`${activityPageType} runs list`}
            list={allRuns?.runs}
            component={RowComponent}
            rowHeight={40}
            hasMore={Boolean(riverRuns?.next_page)}
            isFetching={isFetching}
            listHeight="calc(100vh - 300px)"
          />
        )}
      </Box>
    </>
  );
}

function ColumnNameWrap({ showTooltip, children }) {
  return showTooltip ? (
    <RiveryOverlay placement="auto" description={`(UTC ${getTimeZone()})`}>
      <HStack>
        {children}
        <Icon as={InfoTooltip} boxSize="12px" color="font-secondary" />
      </HStack>
    </RiveryOverlay>
  ) : (
    children
  );
}

function SortButton({ type, sort, sortBy, setShouldSort }) {
  const value = sort.sort_by === type && sort.sort_order;
  return (
    <IconButton
      bg="transparent"
      _hover={{ bg: 'transparent' }}
      onClick={() => {
        setShouldSort(true);
        sortBy(type, getSortOrder(value));
      }}
      size="small"
      aria-label={type}
      ml={value ? '6px' : 'unset'}
      icon={
        <Icon
          as={SortIcon[value] ?? Sort}
          boxSize={!value ? 5 : '10px'}
          ml={value ? 1.5 : 'unset'}
        />
      }
    />
  );
}

type RunQueryKeys = keyof RiverActivitiesRun;
const requiredParams: RunQueryKeys[] = ['start_time', 'end_time', 'riverId'];
