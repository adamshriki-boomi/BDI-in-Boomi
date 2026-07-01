import { Box, chakra } from '@chakra-ui/react';
import {
  ArrowNarrowRight,
  Flex,
  Grid,
  Icon,
  RenderGuard,
  Text,
} from 'components';
import {
  Input,
  RiveryCheckbox,
  RiverySwitch,
  SelectFormGroup,
  SwitchComplexLabel,
} from 'components/Form';
import { InputNumber } from 'components/Form/components/Input/InputNumber';
import 'components/Form/components/RiveryDatePicker.scss';
import { DateRange, TimePeriod } from 'modules/SourceTarget/store';
import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useEffectOnce } from 'react-use';
import { convertDateToISO } from 'utils/date.utils';

interface DateTimeEditorProps {
  value: DateRange;
  onChange: (value: DateRange) => any;
  onlyCustom?: boolean;
  /** Whether to show the Round Up End Date option (for MSSQL/Postgres) */
  showRoundUp?: boolean;
}

type TimeValue = number | string;
type TimeOptions = { min: number; max: number; step?: number };
type TimeSetterFunction =
  | ((value: string | number) => void)
  | ((valueAsString: string, valueAsNumber?: number) => void);

type TimeEntry = [TimeValue, TimeOptions, TimeSetterFunction];

const defaultCustomValue = {
  time_period: 'custom',
  start_date: convertDateToISO(new Date()),
  end_date: null,
  days_back: 0,
  utc_offset: 0,
} as DateRange;

const today = convertDateToISO(new Date());

export function DateTimeEditor({
  value,
  onChange,
  onlyCustom = false,
  showRoundUp = false,
}: DateTimeEditorProps) {
  const hasValidTimePeriod = value && 'time_period' in value;
  const currentValue = hasValidTimePeriod ? value : defaultCustomValue;
  const isCustom = currentValue.time_period === 'custom';
  const utcOffsetValue =
    value?.utc_offset !== undefined
      ? value.utc_offset >= 0
        ? '+' + value.utc_offset
        : value.utc_offset
      : 0;

  // Track if user has manually dismissed round_up
  const userDismissedRoundUp = useRef(false);

  useEffectOnce(() => {
    if (!hasValidTimePeriod) {
      onChange(defaultCustomValue);
    } else if (value.time_period === 'custom' && !value.start_date) {
      onChange({ ...value, start_date: defaultCustomValue.start_date });
    } else {
      onChange(value);
    }
  });

  // Auto-select round_up when include_end_value is enabled (only if user hasn't dismissed it)
  useEffect(() => {
    if (!showRoundUp) return;

    if (
      value?.include_end_value &&
      !userDismissedRoundUp.current &&
      !value?.round_up
    ) {
      onChange({ ...value, round_up: true });
    }
    // Reset the dismissed flag when include_end_value is turned off
    if (!value?.include_end_value && value?.round_up) {
      userDismissedRoundUp.current = false;
      onChange({ ...value, round_up: false });
    }
  }, [value?.include_end_value, showRoundUp, value, onChange]);

  // Handle round_up checkbox change
  const handleRoundUpChange = (checked: boolean) => {
    if (!checked) {
      userDismissedRoundUp.current = true;
    }
    onChange({ ...value, round_up: checked });
  };
  return (
    <Grid gap="3" justifyItems="start">
      <RenderGuard condition={!onlyCustom}>
        <DateRangeSelect
          value={value?.time_period}
          onChange={time_period =>
            time_period === 'custom'
              ? onChange(defaultCustomValue)
              : onChange({ ...value, time_period, utc_offset: 0, days_back: 0 })
          }
        />
      </RenderGuard>
      <RenderGuard
        condition={isCustom}
        fallback={
          <Flex w="450px" flexDir="column" gap={4}>
            <PreviousDays value={value} onChange={onChange} />
            <TimezoneOffset
              value={value}
              onChange={onChange}
              utcOffsetValue={utcOffsetValue}
            />
          </Flex>
        }
      >
        <Flex gap="3" flexDirection={['column', 'row']}>
          <DateContainer pointerEvents={!isCustom ? 'none' : null}>
            <DateTimeInput
              label="Start Date"
              value={
                (value?.start_date || defaultCustomValue.start_date) as any
              }
              onChange={start_date => {
                onChange({
                  ...value,
                  start_date,
                });
              }}
              isDisabled={!isCustom}
              maxDate={today}
            />
            <PreviousDays value={value} onChange={onChange} />
          </DateContainer>
          <Icon
            as={ArrowNarrowRight}
            color="icon"
            display="flex"
            alignSelf="center"
            boxSize="6"
          />
          <DateContainer pointerEvents={!isCustom ? 'none' : null}>
            <Flex flexDir="column" gap={1}>
              <Text color="primary" textStyle="R7">
                End Date
              </Text>
              <FixedEndTimeSwitch value={value} onChange={onChange} />
              <RenderGuard condition={Boolean(value?.end_date)}>
                <Box pt={1} mb={2}>
                  <DateTimeInput
                    label=""
                    value={
                      (value?.end_date || defaultCustomValue.end_date) as any
                    }
                    onChange={end_date => {
                      onChange({ ...value, end_date });
                    }}
                    isDisabled={!isCustom}
                    minDate={value?.start_date}
                  />
                </Box>
              </RenderGuard>
            </Flex>
            <TimezoneOffset
              value={value}
              onChange={onChange}
              utcOffsetValue={utcOffsetValue}
            />
            <Box my={2} width="full">
              <RiverySwitch
                leftLabel
                label="Include End Date Value"
                onChange={target => {
                  onChange({
                    ...value,
                    include_end_value: !Boolean(value?.include_end_value),
                  });
                }}
                isChecked={Boolean(value?.include_end_value)}
                formControlStyle={{ justify: 'space-between' }}
              />
              <Box color="font-secondary" textStyle="R8">
                When enabled, the last value (matching the end date) is
                included. Disable to prevent duplication when using Append
                loading mode.
              </Box>
            </Box>
            {/* Round Up - only for MSSQL and Postgres */}
            <RenderGuard condition={showRoundUp}>
              <Box width="full">
                <RiveryCheckbox
                  name="round_up"
                  label="Round Up End Date"
                  isChecked={Boolean(value?.round_up)}
                  isDisabled={!value?.include_end_value}
                  onChange={e => handleRoundUpChange(e.target.checked)}
                  sx={{
                    '& .chakra-checkbox__control': {
                      borderColor: 'gray.300 !important',
                    },
                  }}
                />
                <Box color="font-secondary" textStyle="R8" ml={6}>
                  Get data for tables with lower granularity than milliseconds
                </Box>
              </Box>
            </RenderGuard>
          </DateContainer>
        </Flex>
      </RenderGuard>
    </Grid>
  );
}

function PreviousDays({ value, onChange }) {
  return (
    <Flex pt={2} gap="3" alignItems="center" justify="space-between" w="full">
      <Text color="font-secondary">Add Number of Previous Days</Text>
      <InputNumber
        value={value?.days_back}
        onChange={days_back => {
          onChange({ ...value, days_back });
        }}
        inputProps={{ min: 0, max: 365 }}
        w="100px"
        fieldHeight="36px"
        alignSelf="end"
      />
    </Flex>
  );
}

function TimezoneOffset({ value, onChange, utcOffsetValue }) {
  return (
    <Flex gap="3" alignItems="center" justify="space-between" w="full">
      <Text color="font-secondary">Time Zone Offset (UTC)</Text>
      <InputNumber
        value={utcOffsetValue}
        onChange={newValue => {
          const numericValue = parseFloat(newValue.toString().replace('+', ''));
          onChange({ ...value, utc_offset: numericValue });
        }}
        inputProps={{ min: -12, max: 12 }}
        w="100px"
        fieldHeight="36px"
        alignSelf="end"
      />
    </Flex>
  );
}

function FixedEndTimeSwitch({ value, onChange }) {
  const end_date = convertDateToISO(new Date());
  return (
    <RiverySwitch
      formControlStyle={{ alignItems: 'baseline' }}
      isChecked={Boolean(value?.end_date)}
      leftLabel
      label={
        <SwitchComplexLabel
          label="Customize End Date"
          description="If no end date is set, the Data Flow run time will automatically be set to the end date of the data-pulling value. For additional configurations, go to the Table settings."
        />
      }
      onChange={({ target }) =>
        onChange({ ...value, end_date: target?.checked ? end_date : null })
      }
    />
  );
}

const DateContainer = chakra(Flex, {
  baseStyle: {
    p: '3',
    border: '1px',
    borderColor: 'gray.200',
    borderRadius: 'md',
    alignItems: 'start',
    w: '450px',
    flexDir: 'column',
  },
});

const NumberInput = ({ value, onChange, divider = false, ...props }) => (
  <>
    <Input
      type="number"
      size="md"
      value={value}
      onChange={onChange}
      w="70px"
      {...props}
    />
    {divider ? ':' : null}
  </>
);

const MSNumberInput = ({ value, onChange, ...props }) => {
  // Special handling for seconds.milliseconds value
  return (
    <NumberInput
      value={value}
      min={0}
      step={1}
      onChange={onChange}
      format={val => {
        // Ensure we maintain the decimal places on display
        const [sec, ms] = val.toString().split('.');
        return `${sec}.${(ms || '000').padEnd(3, '0')}`;
      }}
      w="unset"
    />
  );
};

interface DateInputProps {
  value: Date;
  onChange: (value: Date) => any;
  isDisabled: boolean;
  minDate?: any;
  maxDate?: any;
}

function DateInput({
  value,
  onChange,
  isDisabled,
  minDate = null,
  maxDate = null,
}: DateInputProps) {
  // Format date for input display
  const formatDateForInput = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format min/max dates for HTML input
  const formatMinMaxDate = (date: any) => {
    if (!date) return undefined;
    const dateObj = new Date(date);
    return formatDateForInput(dateObj);
  };

  // Parse date from input
  const parseDateFromInput = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    if (year && month && day) {
      const newDate = new Date(Date.UTC(year, month - 1, day));
      // Preserve the time from the original value
      if (value) {
        const originalTime = new Date(value);
        newDate.setUTCHours(
          originalTime.getUTCHours(),
          originalTime.getUTCMinutes(),
          originalTime.getUTCSeconds(),
          originalTime.getUTCMilliseconds(),
        );
      }
      return newDate;
    }
    return null;
  };

  const [localValue, setLocalValue] = React.useState(formatDateForInput(value));
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleDateInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newDate = parseDateFromInput(e.target.value);
    if (newDate) {
      // Check min date constraint
      if (minDate && newDate < new Date(minDate)) {
        return;
      }

      // Check max date constraint
      if (maxDate && newDate > new Date(maxDate)) {
        return;
      }

      onChange(newDate);
    }
  };

  return (
    <Box w="140px">
      <Input
        type="date"
        value={localValue}
        onChange={handleDateInputChange}
        onBlur={handleDateInputBlur}
        min={formatMinMaxDate(minDate)}
        max={formatMinMaxDate(maxDate)}
        chakra
        size="md"
        isDisabled={isDisabled}
      />
    </Box>
  );
}

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => any;
  label: string;
  isDisabled: boolean;
  minDate?: any;
  maxDate?: any;
}

function DateTimeInput({
  value,
  onChange,
  label,
  isDisabled,
  maxDate,
  minDate,
}: DateTimeInputProps) {
  const api = useMemo(() => {
    const triggerChange = (date: number | Date) => {
      onChange(convertDateToISO(date));
    };
    const dateValue = new Date(value);

    // Extract date and time components separately
    const currentYear = dateValue.getUTCFullYear();
    const currentMonth = dateValue.getUTCMonth();
    const currentDay = dateValue.getUTCDate();
    const currentHours = dateValue.getUTCHours();
    const currentMinutes = dateValue.getUTCMinutes();
    const currentSeconds = dateValue.getUTCSeconds();
    const currentMilliseconds = dateValue.getUTCMilliseconds();

    // Helper function to create a new date by manually constructing it
    const createDateWithTime = (
      year: number,
      month: number,
      day: number,
      hours: number,
      minutes: number,
      seconds: number,
      milliseconds: number,
    ) => {
      // Create the date string manually to avoid any rollover
      const dateString = `${year}-${String(month + 1).padStart(
        2,
        '0',
      )}-${String(day).padStart(2, '0')}T${String(hours).padStart(
        2,
        '0',
      )}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
        2,
        '0',
      )}.${String(milliseconds).padStart(3, '0')}Z`;

      const newDate = new Date(dateString);
      return newDate;
    };

    return {
      hour: (newValue: number) => {
        const newDate = createDateWithTime(
          currentYear,
          currentMonth,
          currentDay,
          newValue,
          currentMinutes,
          currentSeconds,
          currentMilliseconds,
        );
        triggerChange(newDate);
      },
      minutes: (newValue: number) => {
        const newDate = createDateWithTime(
          currentYear,
          currentMonth,
          currentDay,
          currentHours,
          newValue,
          currentSeconds,
          currentMilliseconds,
        );
        triggerChange(newDate);
      },
      secondsWithMilliseconds: (
        valueAsString: string,
        valueAsNumber: number,
      ) => {
        // For spinner buttons, only change the seconds part
        if (!valueAsString.includes('.')) {
          const seconds = Math.floor(valueAsNumber);
          const newDate = createDateWithTime(
            currentYear,
            currentMonth,
            currentDay,
            currentHours,
            currentMinutes,
            seconds,
            currentMilliseconds,
          );
          triggerChange(newDate);
        }
        // For direct text input, parse both seconds and milliseconds
        else {
          const [secStr, msStr] = valueAsString.split('.');
          const seconds = parseInt(secStr, 10);
          const milliseconds = parseInt(msStr.padEnd(3, '0').slice(0, 3), 10);

          if (!isNaN(seconds) && !isNaN(milliseconds)) {
            const newDate = createDateWithTime(
              currentYear,
              currentMonth,
              currentDay,
              currentHours,
              currentMinutes,
              seconds,
              milliseconds,
            );
            triggerChange(newDate);
          }
        }
      },
      triggerChange,
      dateValue,
    };
  }, [value, onChange]);

  const time: TimeEntry[] = [
    [api.dateValue.getUTCHours(), { min: 0, max: 23 }, api.hour],
    [api.dateValue.getUTCMinutes(), { min: 0, max: 59 }, api.minutes],
    // Combined seconds.milliseconds format for display
    [
      `${api.dateValue.getUTCSeconds()}.${api.dateValue
        .getUTCMilliseconds()
        .toString()
        .padStart(3, '0')}`,
      { min: 0, max: 59, step: 1 },
      api.secondsWithMilliseconds,
    ],
  ];

  return (
    <Grid>
      <Text color="primary" textStyle="R7">
        {label}
      </Text>
      <Flex gap="1" alignItems="center">
        <DateInput
          value={new Date(value)}
          onChange={api.triggerChange}
          isDisabled={isDisabled}
          minDate={minDate}
          maxDate={maxDate}
        />
        {time.map(([val, options, apiSet]: TimeEntry, index) => {
          const isSecondsMilliseconds = index === 2; // The combined seconds.milliseconds field

          if (isSecondsMilliseconds) {
            // Special handling for seconds.milliseconds
            return (
              <MSNumberInput
                key={`time-slot-${label}-${index}`}
                value={val as string}
                onChange={(valueAsString: string, valueAsNumber: number) => {
                  apiSet(valueAsString, valueAsNumber);
                }}
                isDisabled={isDisabled}
                aria-label={`time-slot-${label}-${index}`}
                {...(options as object)}
              />
            );
          } else {
            return (
              <NumberInput
                key={`time-slot-${label}-${index}`}
                value={val as number}
                onChange={(value: number) => {
                  apiSet(value as any);
                }}
                isDisabled={isDisabled}
                divider={index < 2}
                aria-label={`time-slot-${label}-${index}`}
                {...(options as object)}
              />
            );
          }
        })}
        <Text>UTC</Text>
      </Flex>
    </Grid>
  );
}

interface DateRangeSelectProps {
  value: TimePeriod | '';
  onChange: (value: TimePeriod) => any;
  isDisabled?: boolean;
}

function DateRangeSelect({
  value,
  onChange,
  isDisabled = false,
}: DateRangeSelectProps) {
  return (
    <Box w="450px">
      <SelectFormGroup
        options={groupedOptions}
        controlId="Date Range"
        placeholder="Date Range"
        onChange={option => onChange((option as any).value)}
        value={Object.values(dateRangeOptions)
          .flat(Infinity)
          .find(range => (range as any)?.value === value)}
        chakra
        isDisabled={isDisabled}
        name="date_range_selection"
      />
    </Box>
  );
}

export const dateRangeOptions = {
  Custom: [{ label: 'Date Range', value: 'custom' }],
  Day: [{ label: 'Yesterday', value: 'yesterday' }],
  Week: [
    { label: 'Week To Date', value: 'week_to_date' },
    { label: 'Previous Week', value: 'previous_week' },
    { label: 'Previous Week To Date', value: 'previous_week_to_date' },
  ],
  Month: [
    { label: 'Month To Date', value: 'month_to_date' },
    { label: 'Previous Month', value: 'previous_month' },
    { label: 'Previous Month To Date', value: 'previous_month_to_date' },
  ],
  Year: [{ label: 'Year To Date', value: 'year_to_date' }],
};

export const groupedOptions = [
  {
    label: 'Custom',
    options: dateRangeOptions.Custom,
  },
  {
    label: 'Day',
    options: dateRangeOptions.Day,
  },
  {
    label: 'Week (Monday - Sunday)',
    options: dateRangeOptions.Week,
  },
  {
    label: 'Month',
    options: dateRangeOptions.Month,
  },
  {
    label: 'Year',
    options: dateRangeOptions.Year,
  },
];
