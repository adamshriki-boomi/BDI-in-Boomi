import { Box } from 'components';
import { SelectFormGroup, RiveryDatePicker } from 'components/Form';
import { useSelectFormStyles } from 'components/Form/components/SelectFormGroup/select.styles';
import { MultiValue } from 'components/Form/components/SelectFormGroup/CustomSelectForm';
import { useGetAllDataSourcesQuery } from 'modules/Datasources/store';
import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useCore } from 'store/core';
import { useDashboardSourcesListQuery } from './dashboard.query';
import { DATA_CONNECTOR_AGENT_API_NAME } from './DashboardDropdownUtils';

import {
  useQueryParam,
  useSetQueryParams,
} from 'hooks/router/useSynchedSearchParam';
import { getTimeZone } from 'utils/date.utils';
import {
  CustomOption as EnvironmentOption,
  useEnvironmentOptions,
} from 'modules/Environments/components/EnvironmentsSelector';
import {
  SourceOption,
  getDropdownCustomStyles,
  convertToEpoch,
  convertToEndOfDayEpoch,
  timestampsToCalendarDates,
  getDateRangePresets,
  getDefaultDateRangePreset,
  createDatePickerOption,
  isValidTimestamp,
} from './DashboardDropdownUtils';
import { TIMEZONES } from './dashboard.query';
import { Tagger } from 'components/Tracking/Tagger';
import { DashboardFilterTags } from 'utils/tracking.tags';

interface Option {
  value: string;
  [key: string]: any;
}

function sortSelectedFirst<T extends Option>(
  options: T[] | undefined,
  selected: T[] | null,
): T[] | undefined {
  if (!options?.length || !selected?.length) return options;
  const selectedValues = new Set(selected.map(o => o.value));
  return [...selected, ...options.filter(o => !selectedValues.has(o.value))];
}

function useQueryParamMultiSelect(key: string) {
  const [param, setParam] = useQueryParam(key);

  const selectedFromParam = useCallback(
    (options: Option[] | undefined) => {
      if (!param || !options) return null;
      const ids = param.split(',').filter(Boolean);
      const selected = options.filter(opt => ids.includes(opt.value));
      return selected.length > 0 ? selected : null;
    },
    [param],
  );

  const updateParam = useCallback(
    (selected: Option[] | Option | null) => {
      const selectedArray = Array.isArray(selected)
        ? selected
        : selected
        ? [selected]
        : [];
      if (selectedArray.length === 0) {
        setParam(null);
      } else {
        const ids = selectedArray.map(item => item.value).join(',');
        setParam(ids);
      }
    },
    [setParam],
  );

  return useMemo(
    () => ({
      selectedFromParam,
      updateParam,
    }),
    [selectedFromParam, updateParam],
  );
}

const EnvironmentOptionWithPadding = props => (
  <EnvironmentOption {...props} px={3} py={4} alignItems="center" />
);

const environmentComponents = {
  SingleValue: EnvironmentOptionWithPadding,
  Option: EnvironmentOptionWithPadding,
  MultiValue,
};

const sourceComponents = {
  SingleValue: SourceOption,
  Option: SourceOption,
  MultiValue,
};

export function EnvironmentDropdown() {
  const options = useEnvironmentOptions('');
  const baseSelectStyle = useSelectFormStyles(true);
  const { selectedFromParam, updateParam } =
    useQueryParamMultiSelect('environments');

  const selectedEnvironments = selectedFromParam(options);
  const sortedOptions = useMemo(() => {
    return sortSelectedFirst(options, selectedEnvironments);
  }, [options, selectedEnvironments]);

  return (
    <Box>
      <Tagger tags={DashboardFilterTags.ENVIRONMENT_DROPDOWN}>
        <SelectFormGroup
          chakra
          isMulti={true}
          components={environmentComponents}
          placeholder="All"
          label="Environment"
          controlId="environment-dropdown"
          options={sortedOptions || []}
          value={selectedEnvironments}
          onChange={updateParam}
          isClearable={true}
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          customStyles={getDropdownCustomStyles(baseSelectStyle)}
        />
      </Tagger>
    </Box>
  );
}

export function SourceDropdown() {
  const { selectedAccountId } = useCore();
  const { data: dataSourcesArray, isLoading: isLoadingDs } =
    useGetAllDataSourcesQuery('source');
  const { data: sourcesListData, isLoading: isLoadingList } =
    useDashboardSourcesListQuery(selectedAccountId ?? '', {
      skip: !selectedAccountId,
    });
  const baseSelectStyle = useSelectFormStyles(true);
  const { selectedFromParam, updateParam } =
    useQueryParamMultiSelect('sources');

  const allowedIds = useMemo(
    () => new Set(sourcesListData?.sources ?? []),
    [sourcesListData?.sources],
  );
  const options = useMemo(() => {
    const list = dataSourcesArray
      ?.filter(
        ds =>
          allowedIds.has(ds.id) &&
          ds.api_name !== DATA_CONNECTOR_AGENT_API_NAME,
      )
      ?.map(({ id, name, icon }) => ({ label: name, value: id, icon }));
    return list?.sort((a, b) => a.label.localeCompare(b.label)) ?? [];
  }, [dataSourcesArray, allowedIds]);

  const selectedSources = selectedFromParam(options);
  const sortedOptions = useMemo(
    () => sortSelectedFirst(options, selectedSources),
    [options, selectedSources],
  );

  return (
    <Box>
      <Tagger tags={DashboardFilterTags.SOURCES_DROPDOWN}>
        <SelectFormGroup
          chakra
          isMulti={true}
          components={sourceComponents}
          placeholder="All"
          label="Source"
          controlId="source-dropdown"
          options={sortedOptions || []}
          value={selectedSources}
          onChange={updateParam}
          isLoading={isLoadingDs || isLoadingList}
          isClearable={true}
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          customStyles={getDropdownCustomStyles(baseSelectStyle)}
        />
      </Tagger>
    </Box>
  );
}

function updateTimestampsFromCalendarDates(
  startDate: Date,
  endDate: Date,
  timezoneMode: 'utc' | 'local',
  setQueryParams: (params: Record<string, string>) => void,
): void {
  const newStartTime = convertToEpoch(startDate, timezoneMode);
  const newEndTime = convertToEndOfDayEpoch(endDate, timezoneMode);

  if (isValidTimestamp(newStartTime) && isValidTimestamp(newEndTime)) {
    setQueryParams({
      start_time: newStartTime.toString(),
      end_time: newEndTime.toString(),
    });
  }
}

export function DateRangeDropdown() {
  const [startTimeParam] = useQueryParam('start_time');
  const [endTimeParam] = useQueryParam('end_time');
  const [timezoneParam] = useQueryParam('timezone');
  const setQueryParams = useSetQueryParams();
  const datePickerRef = useRef<any>(null);
  const hasInitialized = useRef(false);

  const timezoneMode = useMemo(
    () =>
      (timezoneParam === TIMEZONES.UTC ? TIMEZONES.UTC : TIMEZONES.LOCAL) as
        | 'utc'
        | 'local',
    [timezoneParam],
  );

  const getDefaultPresetTimesNow = () => {
    const defaultPreset = getDefaultDateRangePreset();
    const { startDate } = defaultPreset.value;
    return {
      start: convertToEpoch(startDate, timezoneMode),
      end: Date.now(),
    };
  };

  const presetOptions = useMemo(() => {
    const options = getDateRangePresets()
      .map(preset => {
        const { startDate, endDate, toNow } = preset.value;
        const startTime = convertToEpoch(startDate, timezoneMode);
        const endTime = toNow
          ? Date.now()
          : convertToEpoch(endDate, timezoneMode);

        if (!isValidTimestamp(startTime) || !isValidTimestamp(endTime)) {
          return null;
        }

        return {
          label: preset.label,
          value: {
            event_start_time: startTime,
            event_end_time: endTime,
            toNow,
          },
        };
      })
      .filter(
        (preset): preset is NonNullable<typeof preset> => preset !== null,
      );

    return options;
  }, [timezoneMode]);

  // Initialize URL params on first mount if missing
  useEffect(() => {
    if (hasInitialized.current || startTimeParam || endTimeParam) {
      return;
    }

    hasInitialized.current = true;

    const times = getDefaultPresetTimesNow();
    setQueryParams({
      start_time: times.start.toString(),
      end_time: times.end.toString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTimeParam, endTimeParam, setQueryParams, timezoneMode]);

  const hasNormalized = useRef(false);

  useEffect(() => {
    if (hasNormalized.current) {
      return;
    }

    const startTime = startTimeParam ? Number(startTimeParam) : Number.NaN;
    const endTime = endTimeParam ? Number(endTimeParam) : Number.NaN;

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      return;
    }

    hasNormalized.current = true;

    const startOfTodayEpoch = convertToEpoch(new Date(), timezoneMode);
    const matchingPreset = presetOptions.find(opt => {
      if (opt.value.toNow) {
        return (
          opt.value.event_start_time === startTime &&
          endTime >= startOfTodayEpoch
        );
      }
      return (
        opt.value.event_start_time === startTime &&
        opt.value.event_end_time === endTime
      );
    });

    if (matchingPreset) {
      return;
    }

    const times = getDefaultPresetTimesNow();
    setQueryParams({
      start_time: times.start.toString(),
      end_time: times.end.toString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    startTimeParam,
    endTimeParam,
    presetOptions,
    setQueryParams,
    timezoneMode,
  ]);

  const defaultValue = useMemo(() => {
    const defaultPreset = getDefaultDateRangePreset();

    const startTime = startTimeParam ? Number(startTimeParam) : Number.NaN;
    const endTime = endTimeParam ? Number(endTimeParam) : Number.NaN;

    if (Number.isFinite(startTime) && Number.isFinite(endTime)) {
      const startOfTodayEpoch = convertToEpoch(new Date(), timezoneMode);
      const matchingPreset = presetOptions.find(opt => {
        if (opt.value.toNow) {
          return (
            opt.value.event_start_time === startTime &&
            endTime >= startOfTodayEpoch
          );
        }
        return (
          opt.value.event_start_time === startTime &&
          opt.value.event_end_time === endTime
        );
      });

      if (matchingPreset) {
        return matchingPreset;
      }

      const { startDate, endDate } = timestampsToCalendarDates(
        startTime,
        endTime,
      );
      return createDatePickerOption('Custom', startDate, endDate, timezoneMode);
    }

    return createDatePickerOption(
      defaultPreset.label,
      defaultPreset.value.startDate,
      defaultPreset.value.endDate,
      timezoneMode,
    );
  }, [startTimeParam, endTimeParam, timezoneMode, presetOptions]);

  const handlePickerValue = useCallback(
    (event: any) => {
      const { event_start_time, event_end_time } = event?.value || {};

      const startTime = Number(event_start_time);
      const endTime = Number(event_end_time);

      if (Number.isFinite(startTime) && Number.isFinite(endTime)) {
        if (
          startTimeParam &&
          endTimeParam &&
          Number(startTimeParam) === startTime &&
          Number(endTimeParam) === endTime
        ) {
          return;
        }
        const { startDate, endDate } = timestampsToCalendarDates(
          startTime,
          endTime,
        );

        updateTimestampsFromCalendarDates(
          startDate,
          endDate,
          timezoneMode,
          setQueryParams,
        );
      }
    },
    [startTimeParam, endTimeParam, setQueryParams, timezoneMode],
  );

  useEffect(() => {
    if (!startTimeParam && !endTimeParam) {
      datePickerRef.current?.setDefault?.();
    }
  }, [defaultValue, startTimeParam, endTimeParam]);

  return (
    <Box>
      <Tagger tags={DashboardFilterTags.DATE_RANGE_PICKER}>
        <RiveryDatePicker
          ref={datePickerRef}
          label="Date"
          defaultValue={defaultValue}
          preSetOptions={presetOptions}
          setPickerValue={handlePickerValue}
          shouldSetValue={true}
          controlId="date-range-dropdown"
          size="md"
          format="DD-MMM-YYYY"
          showTimePicker={false}
        />
      </Tagger>
    </Box>
  );
}

export function TimezoneDropdown() {
  const [startTimeParam] = useQueryParam('start_time');
  const [endTimeParam] = useQueryParam('end_time');
  const [timezoneParam, setTimezoneParam] = useQueryParam('timezone');
  const setQueryParams = useSetQueryParams();
  const baseSelectStyle = useSelectFormStyles(true);

  const timezoneMode = useMemo(
    () =>
      (timezoneParam === TIMEZONES.UTC ? TIMEZONES.UTC : TIMEZONES.LOCAL) as
        | 'utc'
        | 'local',
    [timezoneParam],
  );

  const getLocalTzLabel = () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = getTimeZone();

    return {
      label: `Local time (UTC ${offset})`,
      title: timeZone,
    };
  };
  const localTz = getLocalTzLabel();

  const options = [
    { label: 'UTC', value: TIMEZONES.UTC },
    {
      label: localTz.label,
      value: TIMEZONES.LOCAL,
    },
  ];

  const selectedOption =
    options.find(opt => opt.value === timezoneMode) || options[0];

  const presetOptions = useMemo(() => {
    return getDateRangePresets().map(preset => {
      const { startDate, toNow } = preset.value;
      return {
        label: preset.label,
        startTime: convertToEpoch(startDate, timezoneMode),
        toNow,
      };
    });
  }, [timezoneMode]);

  const handleChange = useCallback(
    (selected: { label: string; value: string } | null) => {
      const newMode = (selected?.value || TIMEZONES.LOCAL) as 'utc' | 'local';
      setTimezoneParam(newMode);

      if (startTimeParam && endTimeParam) {
        const startTime = Number(startTimeParam);
        const endTime = Number(endTimeParam);

        const currentToNowPreset = presetOptions.find(
          opt => opt.toNow && opt.startTime === startTime,
        );

        if (currentToNowPreset) {
          const calendarDates = timestampsToCalendarDates(
            startTime,
            endTime,
            timezoneMode,
          );
          const newStart = convertToEpoch(calendarDates.startDate, newMode);
          setQueryParams({
            start_time: newStart.toString(),
            end_time: Date.now().toString(),
          });
        } else {
          const calendarDates = timestampsToCalendarDates(
            startTime,
            endTime,
            timezoneMode,
          );
          updateTimestampsFromCalendarDates(
            calendarDates.startDate,
            calendarDates.endDate,
            newMode,
            setQueryParams,
          );
        }
      }
    },
    [
      startTimeParam,
      endTimeParam,
      presetOptions,
      setQueryParams,
      setTimezoneParam,
      timezoneMode,
    ],
  );

  return (
    <Box>
      <Tagger tags={DashboardFilterTags.TIMEZONE_DROPDOWN}>
        <SelectFormGroup
          chakra
          label="Timezone"
          controlId="timezone-dropdown"
          options={options}
          value={selectedOption}
          onChange={handleChange}
          isClearable={false}
          customStyles={getDropdownCustomStyles(baseSelectStyle)}
        />
      </Tagger>
    </Box>
  );
}
