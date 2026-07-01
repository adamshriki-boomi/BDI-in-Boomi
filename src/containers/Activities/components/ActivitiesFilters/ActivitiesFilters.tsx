import { ListAllPayload } from 'api/endpoints/activities.api';
import { Grid, Icon, SearchIcon } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import {
  DateOptionValue,
  findDateByDuration,
  Input,
  isMidnight,
  RiveryDatePicker,
} from 'components/Form';
import { Tagger } from 'components/Tracking/Tagger';
import { RefreshButton } from 'containers/Activities/[id]/components/RefreshButton';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce, useToggle } from 'react-use';
import { calculateTime, getTimeZone } from 'utils/date.utils';
import { ActivitiesTags } from 'utils/tracking.tags';
import { GroupsSelect } from './GroupsSelect';
import { RiverTypeSelect } from './RiverTypeSelect';
import { StatusSelect } from './StatusSelect';

interface DatePickerActivitiesProps {
  value: any;
  onChange: (event: DateOptionValue) => any;
  resetDate: boolean;
  toggleResetDate: any;
  'data-pendo-id'?: string;
}

const DatePickerActivities = ({
  onChange,
  value,
  resetDate,
  toggleResetDate,
  ...rest
}: DatePickerActivitiesProps) => {
  const lastDay = useMemo(
    () => ({ label: 'Current Day', value: calculateTime('C', 0) }),
    [],
  );
  const datePickerRef = useRef<any>(null);

  useEffect(() => {
    if (resetDate) {
      datePickerRef?.current.setDefaultPickerLabel();
      toggleResetDate(false);
    }
  }, [resetDate, toggleResetDate]);

  const defaultDateValue = useMemo(() => {
    return isMidnight(Number(value.start_time)) || !value?.start_time
      ? lastDay
      : findDateByDuration(value?.start_time, value?.end_time);
  }, [lastDay, value?.start_time, value?.end_time]);
  return (
    <RiveryDatePicker
      label={`Date (UTC ${getTimeZone()})`}
      ref={datePickerRef}
      defaultValue={defaultDateValue}
      shouldSetValue
      setPickerValue={event => {
        if (
          event.label === 'Custom' ||
          value.start_time !== event.value.event_start_time ||
          value.end_time !== event.value.event_end_time
        ) {
          onChange(event.value);
        }
      }}
      size="md"
      styleConfig={{ autoHeightControl: true }}
      {...rest}
    />
  );
};

type FiltersValue = Pick<
  ListAllPayload,
  | 'river_type'
  | 'status'
  | 'group_id'
  | 'search'
  | 'start_time'
  | 'end_time'
  | 'is_scheduled'
>;
interface ActivitiesFiltersProps {
  value: FiltersValue;
  onChange: (props: Partial<FiltersValue>) => any;
  onReset: () => any;
}
export function ActivitiesFilters({
  value,
  onChange,
  onReset,
}: ActivitiesFiltersProps) {
  const [resetDate, toggleResetDate] = useToggle(false);

  const resetAll = useCallback(() => {
    toggleResetDate(true);
    onReset();
  }, [onReset, toggleResetDate]);
  return (
    <Grid
      gap={2}
      alignItems="flex-end"
      templateColumns="auto 200px min-content min-content"
      overflow="auto"
    >
      <Grid gap={2} templateColumns="repeat(4, minmax(170px,1fr))">
        <Tagger tags={ActivitiesTags.SEARCH_RIVER_BY_NAME}>
          <RiverNameSearch
            value={value?.search}
            onChange={search => {
              onChange({ search });
            }}
          />
        </Tagger>
        <Tagger tags={ActivitiesTags.SEARCH_RIVER_BY_TYPE}>
          <RiverTypeSelect
            name="river_type"
            onChange={river_type => onChange({ river_type })}
            value={value?.river_type}
          />
        </Tagger>
        <Tagger tags={ActivitiesTags.SEARCH_RIVER_BY_STATUS}>
          <StatusSelect
            name="status"
            onChange={status => onChange({ status })}
            value={value.status}
          />
        </Tagger>
        <Tagger tags={ActivitiesTags.SEARCH_RIVER_BY_GROUP}>
          <GroupsSelect
            name="group_id"
            onChange={group_id => onChange({ group_id })}
            value={value.group_id}
          />
        </Tagger>
        {/* <ScheduledSelect
          name="is_scheduled"
          onChange={is_scheduled =>
            is_scheduled
              ? onChange({ is_scheduled: String(is_scheduled.value) })
              : onChange({ is_scheduled: null })
          }
          value={value.is_scheduled}
        /> */}
      </Grid>
      <Tagger tags={ActivitiesTags.SEARCH_RIVER_BY_DATE}>
        <DatePickerActivities
          onChange={({ event_start_time, event_end_time }) =>
            onChange({
              start_time: event_start_time,
              end_time: event_end_time,
            })
          }
          value={value}
          resetDate={resetDate}
          toggleResetDate={toggleResetDate}
        />
      </Tagger>
      <Tagger tags={ActivitiesTags.CLEAR_BUTTON_CLICK}>
        <RiveryButton label="Clear" variant="text" onClick={resetAll} />
      </Tagger>
      <Tagger tags={ActivitiesTags.REFRESH_BUTTON_CLICK}>
        <RefreshButton />
      </Tagger>
    </Grid>
  );
}

function RiverNameSearch({ value, onChange, ...rest }) {
  const [filter, setFilter] = useState(value);
  useDebounce(
    () => {
      filter !== undefined && onChange(filter);
    },
    400,
    [filter],
  );
  return (
    <Input
      label="Search Data Flow"
      chakra
      size="md"
      iconRight={<Icon as={SearchIcon} boxSize={4} />}
      value={filter}
      onChange={({ target }) => setFilter(target.value)}
      placeholder="Search..."
      type="search"
      {...rest}
    />
  );
}
