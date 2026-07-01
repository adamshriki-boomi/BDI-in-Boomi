import { Box, chakra, Grid, Icon, Portal } from '@chakra-ui/react';
import {
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from 'components';
import {
  createOption,
  Input,
  RadioGroup,
  SelectFormGroup,
} from 'components/Form';
import parser from 'cron-parser';
import cronstrue from 'cronstrue';
import { differenceInMinutes } from 'date-fns';
import { useRiverType } from 'hooks/useRiverType';
import { useToastComponent } from 'hooks/useToast';
import React, { useState } from 'react';
import { BiLinkExternal } from 'react-icons/bi';
import { useEffectOnce } from 'react-use';
import { useAccount } from 'store/core';
import { pluck } from 'utils/array.utils';
import { MultiSelect } from './MultiSelect';
import './ScheduleEditor.scss';
import { normalizeCron } from 'modules/SourceTarget/components/Scheduler/hooks';

const editTypes = (
  block_custom_schedule = false,
  cdcSchedule = false,
  isLogic = false,
) => {
  let types = [
    {
      value: 'minute',
      label: 'Minutes',
      ariaLabel: 'schedule by minutes',
      disabled: block_custom_schedule,
    },
    { value: 'hour', label: 'Hourly', ariaLabel: 'schedule by hours' },
    { value: 'dayOfMonth', label: 'Daily', ariaLabel: 'schedule weekly' },
    {
      value: 'dayOfWeek',
      label: 'Weekly',
      ariaLabel: 'schedule daily',
      disabled: cdcSchedule,
    } as any,
    {
      value: 'month',
      label: 'Monthly',
      ariaLabel: 'schedule for months',
      disabled: cdcSchedule,
    } as any,
    {
      value: 'custom',
      label: 'Custom',
      ariaLabel: 'custom schedule',
      disabled: block_custom_schedule && isLogic,
    },
  ];
  return types;
};

type EditProps = {
  fields: any;
  onChange: (value: any) => any;
  className?: string;
  isCDCRiver?: boolean;
};

const segmentEditors = {
  minute: MinuteRepeatEdit,
  hour: HourRepeatEdit,
  dayOfMonth: DailyRepeatEdit,
  dayOfWeek: WeeklyRepeatEdit,
  month: MonthlyRepeatEdit,
};

interface ScheduleEditorProps {
  schedule: string;
  onChange: (value: string, isValid: boolean) => any;
  /* default {false} - validates 5 fields cron in Custom (when true) */
  short?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isCDCRiver?: boolean;
}
export function ScheduleEditor({
  schedule,
  onChange,
  isDisabled = false,
  isReadOnly = false,
  isCDCRiver = false,
  short = false,
}: ScheduleEditorProps) {
  schedule = schedule?.replaceAll('undefined', '*');
  const fields = getFields(schedule);
  const [displayKey, setDisplayKey] = useState(() =>
    getRepeatKey(fields, schedule),
  );
  const Editor = segmentEditors[displayKey];
  const { isSettingOn } = useAccount();
  const allowCustomSchedule = isSettingOn('block_custom_schedule');
  const { isLogic } = useRiverType();
  const editTypesArr = editTypes(allowCustomSchedule, isCDCRiver, isLogic);
  return (
    <ScheduleSummary
      isReadOnly={isReadOnly}
      isDisabled={isDisabled}
      schedule={short ? normalizeCronTo5Fields(schedule) : schedule}
    >
      <Box shadow="lg" p={6} zIndex={1} aria-label="schedule editor">
        <RadioGroup
          values={editTypesArr}
          name="schedule type"
          onChange={setDisplayKey}
          checked={displayKey || 'custom'}
        />
        <Box py={5} px={1}>
          {Editor ? (
            <Editor
              fields={fields}
              onChange={onChange}
              isCDCRiver={isCDCRiver}
            />
          ) : (
            <CustomEdit
              value={schedule}
              onChange={onChange}
              short={short}
              isCDCRiver={isCDCRiver}
            />
          )}
        </Box>
      </Box>
    </ScheduleSummary>
  );
}

function ScheduleSummary({ schedule, isDisabled, isReadOnly, children }) {
  return (
    <Grid gap="2" templateColumns="100px max-content">
      <Text color={isDisabled ? 'font-disabled' : 'font'}>Run Data Flow</Text>
      <Popover isLazy isOpen={isDisabled || isReadOnly ? false : undefined}>
        <PopoverTrigger>
          <Text
            role="button"
            borderBottom="1px"
            borderBottomColor="gray.300"
            px="2"
            aria-label="schedule summary"
            color={isDisabled ? 'font-disabled' : 'font'}
          >
            {getScheduleText(schedule, undefined, true)}
          </Text>
        </PopoverTrigger>
        <Portal>
          <PopoverContent w="auto">
            <PopoverBody>{children}</PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </Grid>
  );
}

function MinuteRepeatEdit({ fields, onChange }: EditProps) {
  const start = clamp(fields?.minute?.[0] || 0, 0, 59);
  const max = 59 - start;
  const delta =
    fields?.minute?.length === 60
      ? 5
      : fields?.minute?.length > 1
      ? fields.minute[1] - fields.minute[0]
      : 5;
  const minutes = clamp(delta, 1, max);
  useEffectOnce(() => {
    onChange(`0 ${start}/${minutes} * * * * *`);
  });
  const selectedMinute = minutes ? createOption(minutes) : '';

  return (
    <Box>
      Every
      <Box width="70px" display="inline-block" textAlign="center">
        <SelectFormGroup
          controlId="minutes"
          options={ordinalMinutesOptions}
          value={selectedMinute ?? ''}
          onChange={({ value }) =>
            onChange(`0 ${start}/${clamp(Number(value) || 0, 1, 59)} * * * * *`)
          }
          innerProps={
            {
              onClick: e => e.stopPropagation(),
            } as any
          }
        />
      </Box>
      minutes , starting at minute
      <RepeatInput
        aria-label="edit start minutes"
        value={start ?? ''}
        type="number"
        min="0"
        max={59 - minutes}
        step="5"
        onChange={({ target: { value } }) =>
          onChange(`0 ${clamp(Number(value) || 0, 0, 59)}/${minutes} * * * * *`)
        }
      />
    </Box>
  );
}

function HourRepeatEdit({ fields, onChange }: EditProps) {
  const start = clamp(fields?.hour?.[0] || 0, 0, 23);
  const minutes = clamp(fields?.minute?.[0] || 0, 0, 59);
  const max = 23 - start;
  const delta =
    fields?.hour?.length === 24
      ? 1
      : fields?.hour?.length > 1
      ? fields.hour[1] - fields.hour[0]
      : 1;
  const hours = clamp(delta, 1, max);
  const selectedTimeOption = getTimeOption(start, minutes);

  useEffectOnce(() => {
    onChange(`0 ${minutes} ${start}/${hours} * * * *`);
  });

  return (
    <Box>
      Every
      <RepeatInput
        aria-label="edit hours"
        value={hours ?? ''}
        type="number"
        min="1"
        max={max}
        step="1"
        onChange={({ target: { value } }) =>
          onChange(
            `0 ${minutes} ${start}/${clamp(Number(value) || 0, 1, 23)} * * * *`,
          )
        }
      />
      hours, starting at
      <Flex display="inline-flex" gap="2">
        <SelectFormGroup
          withCreate
          defaultCreateLabel="at"
          onAddOption={value =>
            onChange(
              `0 ${getTimeComponents(value)}/${clamp(
                Number(hours) || 0,
                1,
                23,
              )} * * * *`,
            )
          }
          isValidNewOption={value => Boolean(value && getTimeComponents(value))}
          className="time-input"
          controlId="time of day"
          options={halfHourSteps}
          onChange={({ minutes, hours: start }) =>
            onChange(
              `0 ${minutes} ${start}/${clamp(
                Number(hours) || 0,
                1,
                23,
              )} * * * *`,
            )
          }
          value={selectedTimeOption}
          placeholder={`${start % 12 || 12}:${minutes
            .toString()
            .padStart(2, '0')} ${start > 12 ? 'pm' : 'am'}`}
          innerProps={{
            onClick: e => e.stopPropagation(),
          }}
        />
      </Flex>
    </Box>
  );
}

function DailyRepeatEdit({ fields, onChange, isCDCRiver }: EditProps) {
  const { error } = useToastComponent();
  const start = clamp(fields?.dayOfMonth?.[0] || 0, 1, 49);
  const hours = fields?.hour?.[0] || 0;
  const minutes = fields?.minute?.[0] || 0;

  const delta =
    fields?.dayOfMonth?.length === 31
      ? 1
      : fields?.dayOfMonth?.length > 1
      ? fields.dayOfMonth[1] - fields.dayOfMonth[0]
      : 1;
  const days = clamp(delta, 1, 50);
  useEffectOnce(() => {
    onChange(`0 ${minutes} ${hours} ${start}/${days} * * *`);
  });

  const selectedTimeOption = getTimeOption(hours, minutes);

  return (
    <Box>
      Every
      <RepeatInput
        aria-label="edit days"
        value={days ?? ''}
        type="number"
        min="1"
        max={50 - start}
        step="1"
        onChange={({ target: { value } }) => {
          if (isCDCRiver && value !== 1) {
            error({ description: 'CDC data flow must run daily.' });
            return;
          }
          onChange(
            `0 ${clamp(Number(minutes) || 0, 0, 59)} ${clamp(
              Number(hours) || 0,
              0,
              23,
            )} ${start}/${clamp(Number(value) || 0, 1, 50)} * * *`,
          );
        }}
      />
      days, at
      <Flex display="inline-flex" gap="2">
        <SelectFormGroup
          withCreate
          defaultCreateLabel="at"
          onAddOption={value =>
            onChange(
              `0 ${getTimeComponents(value)} ${start}/${clamp(
                Number(days) || 0,
                1,
                50,
              )} * * *`,
            )
          }
          isValidNewOption={value => Boolean(value && getTimeComponents(value))}
          className="time-input"
          controlId="time of day"
          options={halfHourSteps}
          onChange={({ minutes, hours }) =>
            onChange(
              `0 ${clamp(Number(minutes) || 0, 0, 59)} ${clamp(
                Number(hours) || 0,
                0,
                23,
              )} ${start}/${clamp(Number(days) || 0, 1, 50)} * * *`,
            )
          }
          value={selectedTimeOption}
          placeholder={`${hours % 12 || 12}:${minutes
            .toString()
            .padStart(2, '0')} ${hours > 12 ? 'pm' : 'am'}`}
          innerProps={{
            onClick: e => e.stopPropagation(),
          }}
        />
      </Flex>
    </Box>
  );
}

function WeeklyRepeatEdit({ fields, onChange }: EditProps) {
  const days = fields?.dayOfWeek?.length > 6 ? undefined : fields?.dayOfWeek;
  const hours = fields?.hour?.[0] || 0;
  const minutes = fields?.minute?.[0] || 0;

  const selectedTimeOption = getTimeOption(hours, minutes);

  useEffectOnce(() => {
    onChange(`0 ${minutes} ${hours} * * ${getDaysSegment(days)} *`);
  });

  return (
    <Flex flexDir="column">
      <Flex alignItems="center" aria-label="select day of week" gap="1">
        <MultiSelect
          options={daysOfWeekOptions}
          selection={days}
          onChange={changeData => {
            const daysSegment = getDaysSegment(days, changeData);
            const result = `0 ${clamp(Number(minutes) || 0, 0, 59)} ${clamp(
              Number(hours) || 0,
              0,
              23,
            )} * * ${daysSegment} *`;
            onChange(result);
          }}
        />
      </Flex>
      <Flex alignItems="center">
        <Text m={3}>at</Text>
        <SelectFormGroup
          withCreate
          defaultCreateLabel="at"
          onAddOption={value =>
            onChange(
              `0 ${getTimeComponents(value)} * * ${getDaysSegment(days)} *`,
            )
          }
          isValidNewOption={value => Boolean(value && getTimeComponents(value))}
          className="time-input"
          controlId="time of day"
          options={halfHourSteps}
          onChange={({ minutes, hours }) =>
            onChange(
              `0 ${clamp(Number(minutes) || 0, 0, 59)} ${clamp(
                Number(hours) || 0,
                0,
                23,
              )} * * ${getDaysSegment(days)} *`,
            )
          }
          value={selectedTimeOption}
          placeholder={`${hours % 12 || 12}:${minutes
            .toString()
            .padStart(2, '0')} ${hours > 12 ? 'pm' : 'am'}`}
          innerProps={{
            onClick: e => e.stopPropagation(),
          }}
        />
      </Flex>
    </Flex>
  );
}

function MonthlyRepeatEdit({ fields, onChange }) {
  const start = fields?.month?.[0];
  const minutes = fields?.minute?.[0];
  const hours = fields?.hour?.[0];

  const hasDays = fields?.dayOfMonth?.length !== 31;
  const days = hasDays ? fields.dayOfMonth : '*';
  const dayOfWeek = fields?.dayOfWeek;
  const dayIndex = fields?.nthDayOfWeek ?? 1;
  const months =
    fields.month?.length > 1 ? fields.month[1] - fields.month[0] : 1;

  const selectedTimeOption = getTimeOption(hours, minutes);
  const selectedWeekOption = ordinalOptions.find(
    ({ value }) => value === dayIndex,
  );

  useEffectOnce(() => {
    const cronStr =
      dayOfWeek?.length === 1
        ? `0 ${clamp(Number(minutes) || 0, 0, 59)} ${clamp(
            Number(hours) || 0,
            0,
            23,
          )} 1 ${start}/${clamp(Number(months) || 0, 1, 12)} ${
            dayOfWeek[0]
          }#${dayIndex} *`
        : `0 ${clamp(Number(minutes) || 0, 0, 59)} ${clamp(
            Number(hours) || 0,
            0,
            23,
          )} ${hasDays ? days : 1} ${start}/${clamp(
            Number(months) || 0,
            1,
            12,
          )} * *`;
    onChange(cronStr);
  });

  return (
    <Flex flexDir="column">
      <Flex alignItems="center">
        Every
        <Box mx={1} textAlign="center" borderColor="gray.400">
          <RepeatInput
            aria-label="edit months"
            value={months ?? ''}
            type="number"
            min="1"
            max={12 - (start ?? 0)}
            step="1"
            onChange={({ target: { value } }) =>
              onChange(
                dayOfWeek?.length === 1
                  ? `0 ${clamp(Number(minutes) || 0, 0, 59)} ${clamp(
                      Number(hours) || 0,
                      0,
                      23,
                    )} * ${start}/${clamp(Number(value) || 0, 1, 12)} ${
                      dayOfWeek[0]
                    }#${dayIndex} *`
                  : `0 ${clamp(Number(minutes) || 0, 0, 59)} ${clamp(
                      Number(hours) || 0,
                      0,
                      23,
                    )} ${days ?? 1} ${start}/${clamp(
                      Number(value) || 0,
                      1,
                      12,
                    )} * *`,
              )
            }
          />
        </Box>
        <Text mx={1}>months, at</Text>
        <SelectFormGroup
          withCreate
          defaultCreateLabel="at"
          onAddOption={value =>
            onChange(
              `0 ${getTimeComponents(value)} ${days} ${start}/${clamp(
                Number(months) || 0,
                1,
                12,
              )} *`,
            )
          }
          isValidNewOption={value => Boolean(value && getTimeComponents(value))}
          className="time-input"
          controlId="time of day"
          options={halfHourSteps}
          onChange={({ minutes, hours }) =>
            onChange(
              dayOfWeek?.length !== 1
                ? `0 ${clamp(Number(minutes) || 0, 0, 59)} ${clamp(
                    Number(hours) || 0,
                    0,
                    23,
                  )} ${days} ${start}/${months} * *`
                : `0 ${clamp(Number(minutes) || 0, 0, 59)} ${clamp(
                    Number(hours) || 0,
                    0,
                    23,
                  )} * ${start}/${months} ${dayOfWeek[0]}#${dayIndex} *`,
            )
          }
          value={selectedTimeOption}
          placeholder={`${hours % 12 || 12}:${(minutes ?? 0)
            .toString()
            .padStart(2, '0')} ${hours > 12 ? 'pm' : 'am'}`}
          innerProps={
            {
              onClick: e => e.stopPropagation(),
            } as any
          }
        />
      </Flex>
      <Grid
        gridTemplateColumns="repeat(7, 1fr)"
        aria-label="select day of month"
        gap="1"
      >
        <MultiSelect
          options={daysOfMonthOptions}
          selection={dayOfWeek?.length === 1 ? [] : days}
          onChange={cahngeData => {
            const daysSegment = getDaysOfMonthSegment(
              hasDays ? fields.dayOfMonth : [],
              cahngeData,
            );
            onChange(
              `0 ${clamp(Number(minutes) || 0, 0, 59)} ${clamp(
                Number(hours) || 0,
                0,
                23,
              )} ${daysSegment.length ? daysSegment.join(',') : '*'} ${start}/${
                months ?? 1
              } * *`,
            );
          }}
        />
      </Grid>
      <Text color="gray.400">OR</Text>
      <Flex alignItems="center" gap="2">
        The
        <SelectFormGroup
          className="time-input"
          controlId="week of month"
          options={ordinalOptions}
          value={selectedWeekOption}
          onChange={({ value }) =>
            onChange(
              `0 ${minutes} ${hours} * ${start}/${months} ${dayOfWeek[0]}#${value} *`,
            )
          }
          innerProps={
            {
              onClick: e => e.stopPropagation(),
            } as any
          }
        />
      </Flex>
      <Flex alignItems="center" aria-label="select day of week" gap="1">
        <MultiSelect
          options={daysOfWeekOptions}
          selection={dayOfWeek?.length === 1 ? dayOfWeek : []}
          onChange={({ value }) =>
            onChange(
              `0 ${minutes} ${hours} * ${start}/${
                months ?? 1
              } ${value}#${dayIndex} *`,
            )
          }
        />
      </Flex>
    </Flex>
  );
}
const regexCronExp =
  /^\s*($|#|\w+\s*=|(\?|\*|(?:[0-5]?\d)(?:(?:-|\/|,)(?:[0-5]?\d))?(?:,(?:[0-5]?\d)(?:(?:-|\/|,)(?:[0-5]?\d))?)*)\s+(\?|\*|(?:[0-5]?\d)(?:(?:-|\/|,)(?:[0-5]?\d))?(?:,(?:[0-5]?\d)(?:(?:-|\/|,)(?:[0-5]?\d))?)*)\s+(\?|\*|(?:[01]?\d|2[0-3])(?:(?:-|\/|,)(?:[01]?\d|2[0-3]))?(?:,(?:[01]?\d|2[0-3])(?:(?:-|\/|,)(?:[01]?\d|2[0-3]))?)*)\s+(\?|\*|(?:0?[1-9]|[12]\d|3[01]|last)(?:(?:-|\/|,)(?:0?[1-9]|[12]\d|3[01]|last))?(?:,(?:0?[1-9]|[12]\d|3[01]|last)(?:(?:-|\/|,)(?:0?[1-9]|[12]\d|3[01]))?)*)\s+(\?|\*|(?:[1-9]|1[012])(?:(?:-|\/|,)(?:[1-9]|1[012]))?(?:L|W)?(?:,(?:[1-9]|1[012])(?:(?:-|\/|,)(?:[1-9]|1[012]))?(?:L|W)?)*|\?|\*|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?(?:,(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?)*)\s+(\?|\*|(?:[0-6])(?:(?:-|\/|,|#)(?:[0-6]))?(?:L)?(?:,(?:[0-6])(?:(?:-|\/|,|#)(?:[0-6]))?(?:L)?)*|\?|\*|(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?(?:,(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?)*)(|\s)+(\?|\*|(?:|\d{4})(?:(?:-|\/|,)(?:|\d{4}))?(?:,(?:|\d{4})(?:(?:-|\/|,)(?:|\d{4}))?)+))$/i;
const cron5FieldsRegexp =
  /(^((\*\/)?([0-5]?[0-9])((,|-|\/)([0-5]?[0-9]))*|\*)\s+((\*\/)?((2[0-3]|1[0-9]|[0-9]|00))((,|-|\/)(2[0-3]|1[0-9]|[0-9]|00))*|\*)\s+((\*\/)?([1-9]|[12][0-9]|3[01])((,|-|\/)([1-9]|[12][0-9]|3[01]))*|\*)\s+((\*\/)?([1-9]|1[0-2])((,|-|\/)([1-9]|1[0-2]))*|\*|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|des))\s+((\*\/)?[0-6]((,|-|\/)[0-6])*|\*|00|(sun|mon|tue|wed|thu|fri|sat))\s*-*,*(sun|mon|tue|wed|thu|fri|sat)*$)|@(annually|yearly|monthly|weekly|daily|hourly|reboot)/i;

function CustomEdit({ value, onChange, short = false, isCDCRiver = false }) {
  const { isSettingOn } = useAccount();
  const cron = short ? normalizeCronTo5Fields(value) : value;
  const dailyExpression = short && isValidForCDCRiver(cron);
  const pattern = short ? cron5FieldsRegexp : regexCronExp;
  const invalidExpression = !dailyExpression && isCDCRiver;
  const blockCustomSchedule = isSettingOn('block_custom_schedule');
  const blockedByPlan = blockCustomSchedule && !isValidForStarter(cron);
  const linkDetails = short
    ? 'https://crontab.cronhub.io/'
    : 'https://help.boomi.com/docs/Atomsphere/Data_Integration/Rivers/SourcetoTargetRiver/settings-schedule-tab';
  return (
    <>
      <Input
        aria-label="edit custom"
        value={cron}
        required={true}
        pattern={pattern}
        defaultErrorMessage='Cron expression is invalid. For more information, click on "What is a cron expression?"'
        validationError={
          invalidExpression
            ? 'CDC data flow must run daily. The selected custom expression is not allowed for CDC data flows.'
            : blockedByPlan
            ? 'This expression is not allowed in your plan type'
            : null
        }
        chakra
        // Maybe set a form error? Disable Apply?
        onChange={({ target }) => {
          const isValid = isValidExpression(target?.value, isCDCRiver);
          const isAllowedByPlan =
            !blockCustomSchedule ||
            (blockCustomSchedule && isValidForStarter(target?.value));
          onChange(target?.value, isValid && isAllowedByPlan);
        }}
      />
      <a href={linkDetails} rel="noreferrer" target="_blank">
        What is a cron expression?
        <Icon as={BiLinkExternal} ml={1} />
      </a>
    </>
  );
}

export const isValidExpression = (exp, isCDCRiver) =>
  isCDCRiver ? isValidForCDCRiver(exp) : true;

export const isValidForCDCRiver = (cron: string) => {
  if (cron) {
    const parsed = parser?.parseExpression(cron);
    const next = (parsed?.next() as any)?._date.ts;
    const prev = (parsed?.prev() as any)?._date.ts;
    // Checking if the custom expression sets an interval of more than 1440 minutes - which are 24 hours
    return differenceInMinutes(next, prev) <= 1440;
  }
};

export const isValidForStarter = (cron: string) => {
  if (cron) {
    const parsed = parser?.parseExpression(normalizeCronTo5Fields(cron));
    const nextOccurrences = [
      parsed?.next()?.toDate(),
      parsed?.next()?.toDate(),
    ];
    let intervalMins = Infinity;
    if (nextOccurrences.length === 2) {
      const intervalMs: number =
        (nextOccurrences[1] as any) - (nextOccurrences[0] as any);
      intervalMins = intervalMs / (1000 * 60);
    }

    // Checking if the custom expression sets an interval of less than 60 minutes
    return intervalMins >= 60;
  }
};

export const isValid5CharCronIndex = (index: number, expLen) =>
  //Checking if the experession is already normalized to linux cron format
  expLen > 5 ? index > 0 && index < 6 : true;

export const normalizeCronTo5Fields = (cron: string) => {
  const expArray = cron?.split(' ');
  const newArray = expArray?.filter((value, index) =>
    isValid5CharCronIndex(index, expArray.length),
  );
  return newArray?.join(' ');
};

const getDaysOfMonthSegment = (days, changeData = undefined) => {
  if (changeData) {
    const { value, checked } = changeData;
    if (checked) {
      return days.concat(value).sort((v1, v2) => v1 - v2);
    } else {
      return days.filter(day => value !== day);
    }
  }
};

const getDaysSegment = (days, changeData = undefined) =>
  daysOfWeekOptions
    .filter(option => {
      if (changeData) {
        const { value, label, checked } = changeData;
        if (option.value === value || option.label === label) {
          return checked;
        }
      }
      return days?.includes(option.value) || days?.includes(option.label);
    })
    .map(pluck('label'))
    .join(',') || '*';

const halfHourSteps = Array.from({ length: 48 }, (_, index) => {
  const partOfDay = index >= 24 ? 'pm' : 'am';
  const hours = Math.floor(index / 2);
  const minutes = index % 2 ? 30 : 0;

  return {
    value: `${minutes} ${hours}`,
    label: `${hours % 12 || 12}:${minutes
      .toString()
      .padStart(2, '0')} ${partOfDay}`,
    minutes,
    hours,
  };
});

const daysOfWeekOptions = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(
  (label, value) => ({
    label,
    displayLabel: `${label[0]}${label[1].toLowerCase()}`,
    value: (value + 1) % 7,
  }),
);

const daysOfMonthOptions = Array.from({ length: 31 }, (_, label) => ({
  label: label + 1,
  value: label + 1,
}));

const ordinalOptions = ['1st', '2nd', '3rd', '4th', '5th'].map(
  (label, index) => ({
    label,
    value: index + 1,
  }),
);
const ordinalMinutesOptions = [5, 10, 15, 20, 30].map(label => ({
  label,
  value: label,
}));

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getFields(schedule) {
  try {
    const fragments = schedule.split(/\s+/).slice(0, 6);
    const parse = parser.parseExpression(fragments.join(' '));
    return Object.assign(
      {
        nthDayOfWeek: (parse as any)._options.nthDayOfWeek,
      },
      parse.fields,
    );
  } catch (e) {
    return {};
  }
}

function getTimeComponents(value) {
  const match = value.match(/^(\d{1,2})\s?:\s?(\d{2}\s?)((am|pm)?)\s?$/);
  if (!match) {
    return null;
  }
  const [, hourStr, minuteStr, partOfDay] = match;
  const minute = Number(minuteStr);
  if (clamp(minute, 0, 59) !== minute) {
    return null;
  }
  const hour = Number(hourStr);
  if (clamp(hour, 0, partOfDay ? 12 : 23) !== hour) {
    return null;
  }
  return `${minute} ${partOfDay === 'pm' ? hour + 12 : hour}`;
}

function getTimeOption(hours, minutes) {
  return (
    halfHourSteps.find(
      options => options.minutes === minutes && options.hours === hours,
    ) ?? ''
  );
}

export function getScheduleText(
  schedule,
  customLabel = 'Custom',
  verbose = false,
) {
  try {
    return cronstrue.toString(schedule?.replaceAll(/undefined/gi, '0'), {
      verbose,
      use24HourTimeFormat: true,
    });
  } catch (e) {
    return customLabel;
  }
}

const repeatingFieldsConfig: [string, number][] = [
  ['minute', 60],
  ['hour', 24],
  ['dayOfMonth', 31],
  ['month', 12],
  ['dayOfWeek', 8],
];

const repeatedByExpression = {
  minute: /^\d{1,2} \d{1,2}\/\d{1,2} [*|?] [*|?] [*|?] [*|?] [*|?]$/,
  hour: /^\d{1,2} \d{1,2} (\d{1,2})\/\d+ ((1\/1)|[*|?]) [*|?] [*|?] [*|?]$/,
  dayOfMonth: /^\d{1,2} \d{1,2} \d{1,2} \d{1,2}\/\d{1,2} [*|?] [*|?] [*|?]$/,
  month: /^\d{1,2} \d{1,2} \d{1,2} [\d,]+ ((1\/1)|[*|?]) [*|?] [*|?]$/,
};

const isRepeated = (fields, key, fullSize, schedule) => {
  const regex = repeatedByExpression[key];
  const match = regex ? schedule.match(regex) : null;
  if (match ?? (fields[key].length > 1 && fields[key].length !== fullSize)) {
    //added this condition to check if the jump size is the right one- if not it should be custom
    const jump = fullSize / fields[key].length;
    const first = fields[key][0];
    const second = fields[key][1];
    if (second - first === jump) {
      return true;
    }
  }
  return false;
}; //this is a hotfix - we will define repeated with slash in the right place

function getRepeatKey(fields, schedule) {
  const normalize_cron = normalizeCron(schedule);
  if (!(fields && Object.keys(fields).length)) {
    return '';
  }
  const repeatingFields = repeatingFieldsConfig.filter(([key, fullSize]) =>
    isRepeated(fields, key, fullSize, normalize_cron),
  );
  if (repeatingFields.length) {
    if (repeatingFields.length === 1) {
      return repeatingFields[0][0];
    } else {
      return '';
    }
  } else {
    return '';
  }
}

function RepeatInput(props) {
  return (
    <chakra.input
      aria-label="edit minutes"
      mx="1"
      textAlign="center"
      borderBottomColor="gray.400"
      borderBottom="1px"
      outline="none"
      {...props}
    />
  );
}
