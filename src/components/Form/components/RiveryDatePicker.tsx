import { Flex, HStack, Text } from '@chakra-ui/react';
import RiveryButton from 'components/Buttons/RiveryButton';
import { RenderGuard } from 'components';
import { CustomSelectForm } from 'components/Form/components/SelectFormGroup/CustomSelectForm';
import { isToday, millisecondsToHours } from 'date-fns';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MdOutlineDateRange } from 'react-icons/md';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import { useClickAway } from 'react-use';
import { calculateTime } from 'utils/date.utils';
import './RiveryDatePicker.scss';
import {
  DropdownIndicatorContainer,
  SelectFormGroupProps,
} from './SelectFormGroup';

function formatDateValue(value: any[], format: string) {
  const dates = value.map(day => day?.format(format));
  return value.length > 0 ? `${dates[0]} - ${dates[1]}` : 'Set date range';
}

function formatSingleValueFooter(value) {
  return value?.format('ddd. DD MMM');
}

function formatDateValueFooter(day, index: 'start' | 'end') {
  const dayFormat = formatSingleValueFooter(day);
  return (
    <Text fontWeight="normal">{day ? dayFormat : `Select ${index} date`}</Text>
  );
}

function setDefaultTimeToDate(date, hours = 8, minutes = 0) {
  const newDate = new Date(date);
  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  return newDate.getTime();
}

function CustomDateValueComponent({
  isCustomValue,
  selectedValue,
  dateValue,
  format,
}) {
  const dateLabel = isCustomValue
    ? formatDateValue(dateValue, format)
    : selectedValue.label;
  return (
    <Text
      mb={0.2}
      gridArea="1/1/2/3"
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      width="95%"
    >
      {dateLabel}
    </Text>
  );
}

function CustomOption({ innerProps, children }) {
  return (
    <Flex alignItems="center" {...innerProps} gridArea="1/1/2/3">
      <div>{children}</div>
    </Flex>
  );
}
export const createDateOption = (
  event_start_time: number,
  event_end_time: number,
) => ({
  event_start_time,
  event_end_time,
});
export type DateOptionValue = {
  event_start_time: number;
  event_end_time: number;
};
interface DateOptionType {
  label: string;
  value: DateOptionValue;
}

interface IRiveryDatePicker
  extends Pick<SelectFormGroupProps, 'size' | 'styleConfig'> {
  label?: string;
  ariaLabel?: string;
  defaultValue?: DateOptionType;
  preSetOptions?: DateOptionType[];
  setPickerValue?(value): void;
  controlId?: string;
  isDisabled?: boolean;
  shouldSetValue?: boolean;
  calendarPosition?: string;
  format?: string;
  showTimePicker?: boolean;
  'data-pendo-id'?: string;
}

const selectDateOptions = () => {
  return [
    {
      label: 'Last 2 Hours',
      value: calculateTime('H', 2),
    },
    { label: 'Last 6 Hours', value: calculateTime('H', 6) },
    { label: 'Current Day', value: calculateTime('C', 0) },
    { label: 'Last 24 Hours', value: calculateTime('D', 1) },
    { label: 'Last 2 Days', value: calculateTime('D', 2) },
    { label: 'Last 3 Days', value: calculateTime('D', 3) },
    { label: 'Last 7 Days', value: calculateTime('D', 7) },
    { label: 'Last 30 Days', value: calculateTime('D', 30) },
  ];
};

export function findDateByDuration(event_start_time, event_end_time) {
  const dateOptions = selectDateOptions();
  const presetDate = dateOptions.find(({ value }) => {
    const presetDuration = millisecondsToHours(
      value.event_end_time - value.event_start_time,
    );
    const currentDuration = millisecondsToHours(
      Number(event_end_time) - Number(event_start_time),
    );
    return (
      presetDuration === currentDuration && isToday(Number(event_end_time))
    );
  });
  return presetDate
    ? presetDate
    : { label: 'Custom', value: { event_start_time, event_end_time } };
}

function createDateObjects(...dates) {
  return dates.map(date => new DateObject(date));
}

export const RiveryDatePicker = forwardRef(
  (
    {
      label = 'Date',
      defaultValue = { label: null, value: null },
      preSetOptions = selectDateOptions(),
      setPickerValue,
      controlId = 'Date_picker',
      isDisabled = false,
      size,
      ariaLabel = 'date picker',
      shouldSetValue = false,
      calendarPosition = 'bottom-end',
      format = 'DD-MMM-YYYY HH:mm',
      showTimePicker = true,
      'data-pendo-id': pendoId,
    }: IRiveryDatePicker,
    ref,
  ) => {
    const [dateValue, setDateValue] = useState([]);
    const [selectedValue, setSelectValue] =
      useState<DateOptionType>(defaultValue);

    const options = useMemo(
      () => [...preSetOptions, { label: 'Custom', value: [] }],
      [preSetOptions],
    );
    const datePickerRef = useRef<any>(null);
    const isCustomValue = selectedValue?.label === 'Custom';
    if (isCustomValue && dateValue.length === 0) {
      setDateValue(
        createDateObjects(
          selectedValue.value.event_start_time,
          selectedValue.value.event_end_time,
        ),
      );
    }

    const onDateChange = useCallback(dateObject => {
      const startDate = setDefaultTimeToDate(dateObject[0]);
      const endDate = setDefaultTimeToDate(dateObject[1]);
      if ((dateObject as any[]).length === 1) {
        setDateValue([new DateObject(startDate)]);
        return;
      }
      setDateValue(state => [...state, new DateObject(endDate)]);
    }, []);

    //The prop of shouldSetValue is only needed because of the RiverBox re-rendering which affects the activities search field within.
    //Once we fix the RiverBox re-rendering, this can be removed
    useEffect(() => {
      (!shouldSetValue ||
        (shouldSetValue && selectedValue.label !== defaultValue.label)) &&
        setPickerValue(selectedValue);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedValue.value, dateValue]);

    useImperativeHandle(ref, () => ({
      setDefault() {
        return setSelectValue(defaultValue);
      },
      setDefaultPickerLabel() {
        return setSelectValue(state => ({ ...state, label: 'Current Day' }));
      },
    }));

    useClickAway(datePickerRef, () => {
      datePickerRef?.current?.closeCalendar();
    });

    return (
      <Flex flex={1} data-pendo-id={pendoId}>
        <CustomSelectForm
          value={selectedValue}
          label={label}
          ariaLabel={ariaLabel}
          options={options}
          controlId={controlId}
          isMulti={false}
          isSearchable={false}
          closeMenuOnSelect
          isDisabled={isDisabled}
          components={{
            SingleValue: () => (
              <CustomDateValueComponent
                isCustomValue={isCustomValue}
                selectedValue={selectedValue}
                dateValue={dateValue}
                format={format}
              />
            ),
            Option: CustomOption,
            DropdownIndicator: !isCustomValue && DropdownIndicator,
          }}
          onChange={(option: DateOptionType) => {
            if (option.label === 'Custom') {
              datePickerRef?.current?.openCalendar();
            }
            setSelectValue(option);
          }}
          chakra
          height="auto"
          size={size}
        />
        <DatePicker
          format={format}
          inputClass="custom-input"
          calendarPosition={calendarPosition}
          className="custom-date-picker"
          // containerClassName="custom-container"
          ref={datePickerRef}
          value={dateValue}
          onChange={onDateChange}
          range
          numberOfMonths={2}
          offsetY={45}
          maxDate={new Date()}
          zIndex={1000}
        >
          <DatePickerFooter
            value={dateValue}
            datePickerRef={datePickerRef}
            onSetDate={setDateValue}
            onSetSelect={setSelectValue}
            onSetPicker={setPickerValue}
            selectedDate={selectedValue}
            showTimePicker={showTimePicker}
          />
        </DatePicker>
      </Flex>
    );
  },
);

function DropdownIndicator(props) {
  return <DropdownIndicatorContainer {...props} icon={MdOutlineDateRange} />;
}
function DatePickerFooter({
  value,
  datePickerRef,
  onSetDate,
  onSetSelect,
  selectedDate,
  onSetPicker,
  showTimePicker = true,
}) {
  const setTime = (time, position) => {
    onSetDate(state => {
      const current = state[position].format('DD-MMM-YYYY, HH:mm').split(' ');
      const newDate = Date.parse(current[0].concat(time));
      return position === 0
        ? [new DateObject(newDate), state[1]]
        : [state[0], new DateObject(newDate)];
    });
  };

  const apply = useCallback(() => {
    onSetSelect(date => ({
      ...date,
      value: {
        event_start_time: new Date(value[0]).getTime(),
        event_end_time: new Date(value[1]).getTime(),
      },
    }));
  }, [onSetSelect, value]);

  useEffect(() => {
    onSetPicker(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  useEffect(() => {
    if (
      selectedDate?.value?.event_end_time &&
      selectedDate?.value?.event_start_time &&
      datePickerRef?.current?.isOpen
    ) {
      datePickerRef?.current?.closeCalendar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedDate?.value]);

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      px={1}
      py={3}
      m={2}
      borderTop="1px solid"
      borderTopColor="gray.300"
    >
      <RenderGuard condition={showTimePicker} fallback={<div />}>
        <HStack fontSize="xs">
          <FooterTimeSelectionValue
            value={value[0]}
            index="start"
            setTime={time => setTime(time, 0)}
          />
          <Text pr={1}>-</Text>
          <FooterTimeSelectionValue
            index="end"
            value={value[1]}
            setTime={time => setTime(time, 1)}
          />
        </HStack>
      </RenderGuard>
      <HStack gap={2}>
        <RiveryButton
          size="sm"
          label="Clear"
          variant="text"
          onClick={() => onSetDate([])}
        />
        <RiveryButton
          disabled={value.length < 2}
          size="small"
          label="Apply"
          variant="outlined-primary"
          onClick={apply}
        />
      </HStack>
    </Flex>
  );
}

function FooterTimeSelectionValue({ value, setTime, index }) {
  return (
    <>
      {formatDateValueFooter(value, index)}
      <DatePicker
        format="HH:mm"
        value={value}
        inputClass="custom-time-input"
        className="custom-time-picker"
        disableDayPicker
        plugins={[<TimePicker hideSeconds />]}
        onChange={setTime}
        disabled={!value}
      />
    </>
  );
}

export function isMidnight(time) {
  const date = new Date();
  const midnight = new Date(date.setDate(date.getDate())).setHours(0, 0, 0, 0);
  return time === midnight;
}
