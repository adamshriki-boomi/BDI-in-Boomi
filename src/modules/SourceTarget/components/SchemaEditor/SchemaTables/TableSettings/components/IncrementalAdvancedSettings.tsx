import { Collapse } from '@chakra-ui/react';
import { ExtractMethod, SourceTypes } from 'api/types';
import {
  Box,
  ChevronDown,
  ChevronUp,
  Flex,
  HStack,
  Icon,
  RenderGuard,
  Text,
  useDisclosure,
} from 'components';
import {
  CustomSelectForm,
  Input,
  InputTypes,
  RiverySwitch,
  SwitchComplexLabel,
} from 'components/Form';
import { useTableSettingsFormContext } from '../form.hooks';

export function AdvancedSettings({ incrementalType, sourceDefinition }) {
  const formApi = useTableSettingsFormContext();
  const { isOpen, onToggle } = useDisclosure();
  const isChunkBySelected = !['dont_split', undefined].includes(
    formApi.watch('table.date_range.split_time_intervals.time_interval'),
  );

  const hasDatetimeSettings = incrementalType === 'datetime';
  const hasMongoSettings = sourceDefinition?.name === SourceTypes.MONGO;
  const hasAnySettings = hasDatetimeSettings || hasMongoSettings;
  if (
    !hasAnySettings ||
    formApi.watch('table.extract_method') !== ExtractMethod.INCREMENTAL
  )
    return null;
  const selectedTimeInterval = chunkSizeOptions.find(
    opt =>
      opt.value ===
      formApi.watch('table.date_range.split_time_intervals.time_interval'),
  );
  return (
    <Box w="450px">
      <HStack
        pt={4}
        pb={2}
        onClick={onToggle}
        borderBottom={!isOpen ? '1px' : null}
        borderBottomColor="gray.300"
        role="button"
        justify="space-between"
      >
        <Text textAlign="left" color="primary">
          Advanced Settings
        </Text>
        <Icon color="primary" as={isOpen ? ChevronUp : ChevronDown} />
      </HStack>
      <Collapse in={isOpen}>
        <Flex
          flexDir="column"
          gap={3}
          py={4}
          px={6}
          borderRadius={4}
          {...(isOpen && {
            border: '1px solid var(--chakra-colors-gray-300)',
          })}
        >
          <RenderGuard condition={incrementalType === 'datetime'}>
            <RiverySwitch
              formControlStyle={{ alignItems: 'baseline' }}
              leftLabel
              label={
                <SwitchComplexLabel
                  label="Update incremental date range also on failures"
                  description={
                    <Box>
                      Data Flow will increment the start date even if the
                      previous run failed. <strong>(Not recommended)</strong>
                    </Box>
                  }
                />
              }
              api={formApi}
              name="table.date_range.update_increment_on_failures"
            />
          </RenderGuard>
          <RenderGuard condition={sourceDefinition?.name === SourceTypes.MONGO}>
            <Flex flexDir="column">
              <Text>Number of Connections to MongoDB</Text>
              <Input
                type={InputTypes.NUMBER}
                chakra
                api={formApi}
                label={`Please Note, setting this option will open ${formApi?.watch(
                  'table.additional_source_settings.concurrent_requests_number',
                )} concurrent requests to your MongoDB.`}
                name="table.additional_source_settings.concurrent_requests_number"
                placeholder="1"
                defaultValue={1}
              />
            </Flex>
          </RenderGuard>
          <RenderGuard condition={incrementalType === 'datetime'}>
            <Flex flexDir="column">
              <Text color="primary">Interval Chunks Size</Text>
              <CustomSelectForm
                options={chunkSizeOptions}
                defaultValue={chunkSizeOptions[0]}
                value={selectedTimeInterval}
                controlId=""
                label="Split your loading data into several intervals in case of a large amount of returned data by:"
                isMulti={false}
                onChange={v =>
                  formApi.setValue(
                    'table.date_range.split_time_intervals.time_interval',
                    (v as Record<string, string>)?.value,
                  )
                }
              />
            </Flex>
          </RenderGuard>
          <RenderGuard
            condition={incrementalType === 'datetime' && isChunkBySelected}
          >
            <HStack>
              <Text color="font-secondary">Split Interval Size</Text>
              <Input
                type="number"
                api={formApi}
                name="table.date_range.split_time_intervals.interval_size"
                min={1}
              />
            </HStack>
          </RenderGuard>
        </Flex>
      </Collapse>
    </Box>
  );
}

const chunkSizeOptions = [
  { label: 'Dont Split', value: 'dont_split' },
  { label: 'Minutely', value: 'minutes' },
  { label: 'Hourly', value: 'hours' },
  { label: 'Daily', value: 'days' },
  { label: 'Weekly', value: 'weeks' },
  { label: 'Monthly', value: 'months' },
  { label: 'Yearly', value: 'years' },
];
