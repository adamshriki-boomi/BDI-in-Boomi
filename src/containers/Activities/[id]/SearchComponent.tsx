import {
  Center,
  DRAWER_PARAM_NAME,
  Flex,
  Grid,
  logsStatusMap,
  RiveryButton,
  StepLogStatus,
} from 'components';
import {
  createDateOption,
  CustomSelectForm,
  findDateByDuration,
  isMidnight,
  RiveryDatePicker,
} from 'components/Form';
import { Tagger } from 'components/Tracking/Tagger';
import { filterUnique } from 'modules/Environments/Deployments/components/helpers';
import { useEffect, useMemo, useRef } from 'react';
import { pluck } from 'utils/array.utils';
import { calculateTime, getTimeZone } from 'utils/date.utils';
import { ActivitiesTags } from 'utils/tracking.tags';
import {
  hasRequiredParams,
  parseSearchParams,
  removeParams,
} from 'utils/searchParams';
import { StatusDisplay } from '../components/StatusDisplay';
import { useRiverId } from '../helpers';
import { useGetActivityStatsQuery } from '../store';
import { useParams } from '../useFetchActivities';
import { RefreshButton } from './components/RefreshButton';
import { useViewParamResolver, ViewRadios } from './components/ViewRadios';
import { HELPER_PARAMS } from './params';

const paramsToRemove = [
  ...HELPER_PARAMS,
  DRAWER_PARAM_NAME,
  'sub_river_id',
  'search',
  'pageSize',
  'pageIndex',
  'river_drawer',
];

export function SearchComponent() {
  const datePickerRef = useRef<any>(null);
  const { api } = useParams();
  const { isRunsView } = useViewParamResolver();
  // using `parseSearchParams` twice in order to support the array syntax i.e: param=1&param=2
  const params = parseSearchParams(
    removeParams(window.location.search, paramsToRemove),
  );
  const activity = useActivityRiver(params);

  const { start_time, end_time, status } = params;
  const lastDay = useMemo(
    () => ({ label: 'Current Day', value: calculateTime('C', 0) }),
    [],
  );

  const dateValue = createDateOption(Number(start_time), Number(end_time));

  const defaultDateValue = useMemo(() => {
    return isMidnight(start_time) || !start_time
      ? lastDay
      : findDateByDuration(start_time, end_time);
  }, [lastDay, end_time, start_time]);

  const setStatusValue = options => {
    const nextStatus =
      typeof options === 'string'
        ? resolveStatus(status, options)
        : options.map(pluck('value'));
    api.setParam({ status: nextStatus });
  };

  const statusValue = () => {
    if (!status) {
      return [];
    }
    if (typeof status == 'string') {
      return statusRunOptions?.filter(({ value }) => status === value);
    }
    return status?.flatMap(s => statusRunOptions.filter(o => o.value === s));
  };

  useEffect(() => {
    if (isMidnight(dateValue.event_start_time)) {
      datePickerRef?.current?.setDefault();
    }
  }, [dateValue.event_start_time]);

  return (
    <Flex
      justify="space-between"
      alignItems="flex-end"
      borderBottom="1px solid"
      borderBottomColor="gray.300"
      pb={2}
      gap={4}
    >
      <Grid
        templateColumns="4fr 3fr 1fr 1fr"
        w={700}
        mr="auto"
        gap={3}
        alignItems="flex-end"
      >
        <Tagger tags={ActivitiesTags.SEARCH_INNER_RIVER_BY_STATUS}>
          <CustomSelectForm
            isDisabled={!isRunsView}
            label="Status"
            name="status"
            options={statusRunOptions}
            controlId={'run status'}
            updateFilter={setStatusValue}
            value={statusValue()}
          />
        </Tagger>
        <Tagger tags={ActivitiesTags.SEARCH_INNER_RIVER_BY_DATE}>
          <RiveryDatePicker
            label={`Date (UTC ${getTimeZone()})`}
            ref={datePickerRef}
            defaultValue={defaultDateValue}
            shouldSetValue={params.end_time}
            calendarPosition="bottom"
            setPickerValue={event => {
              if (
                Boolean(Object.keys(event?.value)?.length) &&
                dateValue !== event.value
              ) {
                const { event_start_time, event_end_time } = event.value;
                api.setParam({
                  start_time: event_start_time,
                  end_time: event_end_time,
                });
              }
            }}
          />
        </Tagger>
        <Tagger tags={ActivitiesTags.INNER_CLEAR_BUTTON_CLICK}>
          <RiveryButton
            variant="text"
            label="Clear"
            onClick={() => api.resetParams()}
          />
        </Tagger>
        <Tagger tags={ActivitiesTags.INNER_REFRESH_BUTTON_CLICK}>
          <RefreshButton />
        </Tagger>
      </Grid>
      <Center layerStyle="baseHeight">
        <StatusDisplay {...activity} />
        <ViewRadios />
      </Center>
    </Flex>
  );
}

// HELPERS
const statusVariations = Object.keys(logsStatusMap);
const nonOptions = [StepLogStatus.DONE, StepLogStatus.ERROR] as string[];
const statusRunOptions = statusVariations
  .filter(status => {
    return !nonOptions.includes(status);
  })
  .map(v => ({
    label: v.charAt(0).toUpperCase() + v.slice(1),
    value: v.toLowerCase(),
  }))
  .filter(filterUnique);
const requiredParams = ['start_time', 'end_time'];
const useActivityRiver = params => {
  const riverId = useRiverId();
  const allParams: any = parseSearchParams(
    removeParams(window.location.search, paramsToRemove),
  );
  const { data } = useGetActivityStatsQuery(
    { riverId, ...allParams },
    {
      skip: !riverId || !hasRequiredParams(requiredParams, params),
    },
  );
  return data;
};

const resolveStatus = (status, options) => {
  return typeof status == 'string'
    ? null
    : (status as string[]).filter(val => val !== options);
};
