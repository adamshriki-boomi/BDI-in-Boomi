import {
  Flex,
  InfiniteScrollComponent,
  ResultsPanelInnerSpinner,
  Text,
} from 'components';
import { useRiverId } from 'containers/Activities/helpers';
import { useGetSubRiversQuery } from 'containers/Activities/store';
import { useParams } from 'containers/Activities/useFetchActivities';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParam } from 'react-use';
import { createSearchParam, parseSearchParams } from 'utils/searchParams';
import {
  useIsViewLoading,
  useViewParamResolver,
} from '../components/ViewRadios';

const hasDates = params => {
  return [params?.start_time, params?.end_time].every(Boolean);
};

export function SubRivers({ param, filter = true }) {
  const riverId = useRiverId();
  const params = parseSearchParams();
  const isViewLoading = useIsViewLoading(param);
  const shouldSkip = filter && (isViewLoading || !params?.run);
  const { isSubRivers } = useViewParamResolver();
  const {
    data: subRivers,
    isFetching,
    isLoading,
  } = useGetSubRiversQuery(
    {
      riverId,
      start_time: params?.start_time,
      end_time: params?.end_time,
      ...(filter || !isSubRivers ? { [param]: params?.run } : {}),
    },
    {
      skip: shouldSkip || !Boolean(riverId) || !hasDates(params),
    },
  );
  const loading = isFetching || isLoading;

  return (
    <Flex w="full" flexDir="column" gap={0.5} overflow="hidden">
      {loading ? (
        <Flex h="full" w="full">
          <ResultsPanelInnerSpinner />
        </Flex>
      ) : null}
      <Flex
        w="full"
        px={4}
        alignItems="center"
        height="40px"
        borderRadius={4}
        bg="background-secondary"
        fontWeight="medium"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        <Text pr={1}>Sub-Data Flows</Text>
        <Text fontWeight="normal" fontSize="sm">
          - Select sub data flow to view runs
        </Text>
      </Flex>

      {subRivers?.length === 0 && !loading ? null : (
        <InfiniteScrollComponent
          ariaLabel="sub rivers runs list"
          list={subRivers}
          component={({ item, index }) => (
            <SubRiver
              id={item.sub_river_id}
              name={item.sub_river_name}
              index={index}
            />
          )}
          rowHeight={40}
        />
      )}
    </Flex>
  );
}

/**
 * set the search param 'sub_river_id' if not already exists
 */
function useSelectFirstSubRiver({ id }) {
  const { api } = useParams();
  const subRiverIdParam = useSearchParam('sub_river_id');
  const shouldSetParam = Boolean(!subRiverIdParam && id);
  useEffect(() => {
    if (shouldSetParam) {
      api.setParam({ sub_river_id: id });
    }
  }, [api, id, shouldSetParam, subRiverIdParam]);
}

function SubRiver({ id, name, index }) {
  const subRiverIdParam = useSearchParam('sub_river_id');
  const { isSubRivers } = useViewParamResolver();
  const { params } = useParams();
  const active = subRiverIdParam ? subRiverIdParam === id : index === 0;

  useSelectFirstSubRiver({
    id,
  });

  return (
    <Flex
      fontSize="sm"
      w="full"
      bg={active ? 'gray.200' : 'white'}
      _hover={{ bg: 'background-secondary' }}
      fontWeight="normal"
      as={Link}
      px={4}
      alignItems="center"
      height="40px"
      to={{
        search: createSearchParam(
          { sub_river_id: id, run: isSubRivers ? null : params?.run },
          true,
        ),
      }}
    >
      {name}
    </Flex>
  );
}
