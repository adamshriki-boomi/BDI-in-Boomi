import { Grid } from '@chakra-ui/react';
import { HStack, Image, RenderGuard, Text } from 'components';
import { endOfMonth, startOfDay, startOfMonth, subMonths } from 'date-fns';
import { type Timezone, TIMEZONES } from './dashboard.query';

export const DATA_CONNECTOR_AGENT_API_NAME = 'blueprint_copilot';

export function SourceOption(props) {
  return (
    <Grid gridArea="1/1/2/3">
      <HStack {...props} px={3} py={2}>
        <RenderGuard condition={!!props.data.icon}>
          <Image src={props.data.icon} boxSize={5} objectFit="contain" />
        </RenderGuard>
        <Text
          size="small"
          fontWeight={props.isSelected ? 'medium' : 'normal'}
          flexGrow={1}
          display="flex"
        >
          {props.data.label}
        </Text>
      </HStack>
    </Grid>
  );
}

export function getDropdownCustomStyles(baseSelectStyle) {
  return {
    control: (styles, props) => {
      const { isDisabled } = props;
      return {
        ...styles,
        ...baseSelectStyle.control(styles, props),
        opacity: isDisabled ? 0.8 : 1,
      };
    },
  };
}

// ============================================================================
// Date & Timezone Utilities
// ============================================================================

/**
 * Converts a Date to epoch milliseconds based on timezone mode.
 * For UTC: creates midnight UTC for the date.
 * For local: creates midnight in browser's local timezone.
 */
export function convertToEpoch(date: Date, mode: Timezone): number {
  if (mode === TIMEZONES.UTC) {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
    ).getTime();
  }
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  ).getTime();
}

/**
 * Converts a Date to end-of-day epoch milliseconds (23:59:59.999).
 */
export function convertToEndOfDayEpoch(date: Date, mode: Timezone): number {
  if (mode === TIMEZONES.UTC) {
    return new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999,
      ),
    ).getTime();
  }
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  ).getTime();
}

/**
 * Converts a timestamp to a calendar date (strips time, keeps only date).
 * When mode is 'utc', interprets the timestamp in UTC (so URL params written in UTC
 * are decoded correctly). When 'local', uses browser local time (startOfDay).
 * This must match how convertToEpoch(..., mode) was used when writing the URL.
 */
export function timestampToCalendarDate(
  timestamp: number,
  mode: Timezone = TIMEZONES.LOCAL,
): Date {
  const d = new Date(timestamp);
  if (mode === TIMEZONES.UTC) {
    // Return a Date whose local getFullYear/getMonth/getDate match UTC calendar
    // so convertToEpoch(..., 'utc') produces the correct midnight UTC.
    return new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      0,
      0,
      0,
      0,
    );
  }
  return startOfDay(d);
}

/**
 * Converts timestamps to calendar dates in the given timezone.
 * Use the same timezone mode that was used when these timestamps were written to the URL.
 */
export function timestampsToCalendarDates(
  startTimestamp: number,
  endTimestamp: number,
  timezoneMode: Timezone = TIMEZONES.LOCAL,
): { startDate: Date; endDate: Date } {
  return {
    startDate: timestampToCalendarDate(startTimestamp, timezoneMode),
    endDate: timestampToCalendarDate(endTimestamp, timezoneMode),
  };
}

/**
 * Date range presets for the date picker.
 */
export function getDateRangePresets() {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(now.getDate() - 90);

  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  return [
    {
      label: 'This month',
      value: {
        startDate: startOfDay(thisMonthStart),
        endDate: now,
        toNow: true,
      },
    },
    {
      label: 'Last month',
      value: {
        startDate: startOfDay(lastMonthStart),
        endDate: startOfDay(lastMonthEnd),
      },
    },
    {
      label: 'Last 7 Days',
      value: {
        startDate: startOfDay(sevenDaysAgo),
        endDate: now,
        toNow: true,
      },
    },
    {
      label: 'Last 30 Days',
      value: {
        startDate: startOfDay(thirtyDaysAgo),
        endDate: now,
        toNow: true,
      },
    },
    {
      label: 'Last 90 Days',
      value: {
        startDate: startOfDay(ninetyDaysAgo),
        endDate: now,
        toNow: true,
      },
    },
  ];
}

/**
 * Returns the default date range preset (Last 7 Days).
 */
export function getDefaultDateRangePreset() {
  const presets = getDateRangePresets();
  return presets.find(preset => preset.label === 'Last 7 Days') || presets[2];
}

const LAST_X_DAYS_LABELS = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

/**
 * True when start_time (ms) matches the start of one of "Last 7/30/90 Days" for the given timezone.
 */
export function isLastXDaysRange(
  startTimeMs: number,
  timezoneMode: 'utc' | 'local',
): boolean {
  const presets = getDateRangePresets().filter(p =>
    LAST_X_DAYS_LABELS.includes(p.label),
  );
  return presets.some(
    p => convertToEpoch(p.value.startDate, timezoneMode) === startTimeMs,
  );
}

/**
 * Creates a date picker option from calendar dates.
 */
export function createDatePickerOption(
  label: string,
  startDate: Date,
  endDate: Date,
  timezoneMode: Timezone,
): {
  label: string;
  value: { event_start_time: number; event_end_time: number };
} {
  return {
    label,
    value: {
      event_start_time: convertToEpoch(startDate, timezoneMode),
      event_end_time: convertToEpoch(endDate, timezoneMode),
    },
  };
}

/**
 * Default fallback option for date picker.
 */
export function getDefaultDatePickerOption() {
  return {
    label: 'Last 7 Days',
    value: { event_start_time: 0, event_end_time: 0 },
  };
}

/**
 * Validates if timestamps are valid numbers.
 */
export function isValidTimestamp(value: any): value is number {
  return (
    typeof value === 'number' && Number.isFinite(value) && !Number.isNaN(value)
  );
}
