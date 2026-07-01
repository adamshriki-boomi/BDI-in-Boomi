import { Flex, Text } from '@chakra-ui/react';
import { Box } from 'components';
import { SelectFormGroup } from 'components/Form/components';
import { compare } from 'utils/array.utils';
import './TimeoutSelector.scss';

export function TimeoutSelector({
  shared_params,
  onChange,
  label = 'Timeout data flow execution after',
  fieldKey = 'run_timeout',
  controlId = 'timeout',
}) {
  const value = shared_params[fieldKey] || timeoutOptions[0].value;
  const selectedTimeoutOption =
    timeoutOptions.find(compare('value', value)) ?? '';

  return (
    <Flex display="inline-flex" alignItems="baseline" gap="2">
      <Text>{label}</Text>
      <Box w="200px">
        <SelectFormGroup
          withCreate
          onAddOption={value =>
            onChange({
              ...shared_params,
              [fieldKey]: value,
            })
          }
          placeholder={value ? formatDuration(new Date(value * 1000)) : ''}
          formatCreateLabel={inputValue => {
            return (
              <Flex justifyContent="between">
                <div>{inputValue} seconds</div>
                <div>({formatDuration(new Date(inputValue * 1000))})</div>
              </Flex>
            );
          }}
          noOptionsLabel={
            <div>
              <div>Type duration in seconds </div>
              <div>300 - 86400</div>
              <div>(5 minutes to 24 hours)</div>
            </div>
          }
          isValidNewOption={value =>
            value?.match(/^\d+$/) &&
            Number(value) >= 5 * 60 &&
            Number(value) < 24 * 60 * 60 &&
            !timeoutOptions.find(option => option.value === Number(value))
          }
          filterOption={({ value }, input) => {
            return value === Number(input);
          }}
          controlId={controlId}
          options={timeoutOptions}
          onChange={({ value }) =>
            onChange({
              ...shared_params,
              [fieldKey]: value,
            })
          }
          value={selectedTimeoutOption}
        />
      </Box>
    </Flex>
  );
}

export const timeoutOptions = [
  { label: '12 hours', value: 60 * 60 * 12 },
  { label: '5 minutes', value: 60 * 5 },
  { label: '10 minutes', value: 60 * 10 },
  { label: '15 minutes', value: 60 * 15 },
  { label: '20 minutes', value: 60 * 20 },
  { label: '30 minutes', value: 60 * 30 },
  { label: '40 minutes', value: 60 * 40 },
  { label: '50 minutes', value: 60 * 50 },
  { label: '1 hour', value: 60 * 60 },
  { label: '2 hours', value: 60 * 60 * 2 },
  { label: '3 hours', value: 60 * 60 * 3 },
  { label: '4 hours', value: 60 * 60 * 4 },
  { label: '5 hours', value: 60 * 60 * 5 },
  { label: '6 hours', value: 60 * 60 * 6 },
  { label: '7 hours', value: 60 * 60 * 7 },
  { label: '8 hours', value: 60 * 60 * 8 },
  { label: '9 hours', value: 60 * 60 * 9 },
  { label: '10 hours', value: 60 * 60 * 10 },
  { label: '11 hours', value: 60 * 60 * 11 },
];

const formatDuration = date =>
  Intl.DateTimeFormat('iso', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
    timeZone: 'UTC',
  } as any).format(date);
