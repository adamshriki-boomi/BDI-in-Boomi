import {
  Box,
  Flex,
  Grid,
  Text,
  Icon,
  ArrowNarrowRight,
  RenderGuard,
  HStack,
} from 'components';
import {
  CustomSelectForm,
  Input,
  RiveryCheckbox,
  RiverySwitch,
  SwitchComplexLabel,
} from 'components/Form';
import { IncrementalType, SourceTypes } from 'api/types';
import { DateRange } from 'modules/SourceTarget/store';
import {
  useCustomQueryExtraction,
  CustomQueryIncrementalType,
} from './useCustomQueryExtraction';
import { DateTimePopover } from '../SchemaTables/components/DateTimePopover';
import { useController, useWatch } from 'react-hook-form';

// Sources that support round_up for datetime incremental type
const ROUND_UP_SUPPORTED_SOURCES = [SourceTypes.MSSQL, SourceTypes.POSTGRES];

// Chunk size options for datetime advanced settings
const chunkSizeOptions = [
  { label: 'Dont Split', value: 'dont_split' },
  { label: 'Minutely', value: 'minutes' },
  { label: 'Hourly', value: 'hours' },
  { label: 'Daily', value: 'days' },
  { label: 'Weekly', value: 'weeks' },
  { label: 'Monthly', value: 'months' },
  { label: 'Yearly', value: 'years' },
];

// Incremental type options
const DATETIME_OPTION = { label: 'Timestamp', value: IncrementalType.DATETIME };
const EPOCH_OPTION = { label: 'Epoch', value: IncrementalType.EPOCH };
const RUNNING_NUMBER_OPTION = {
  label: 'Running Number',
  value: IncrementalType.RUNNING_NUMBER,
};
const ROW_VERSION_OPTION = {
  label: 'Row Version',
  value: 'row_version',
};

// Base options available for all sources
const baseIncrementalTypeOptions = [
  DATETIME_OPTION,
  EPOCH_OPTION,
  RUNNING_NUMBER_OPTION,
];

// Sources that support row_version incremental type
const ROW_VERSION_SUPPORTED_SOURCES = [SourceTypes.MSSQL, SourceTypes.POSTGRES];

/**
 * Get incremental type options based on source type
 */
function getIncrementalTypeOptions(sourceName: string) {
  const baseOptions = [...baseIncrementalTypeOptions];
  if (ROW_VERSION_SUPPORTED_SOURCES.includes(sourceName as SourceTypes)) {
    baseOptions.push(ROW_VERSION_OPTION as any);
  }
  return baseOptions;
}

/**
 * Get the selected type option from the current value
 */
function getSelectedTypeOption(type: CustomQueryIncrementalType) {
  if (type === 'datetime') return DATETIME_OPTION;
  if (type === 'epoch') return EPOCH_OPTION;
  if (type === 'runningnumber') return RUNNING_NUMBER_OPTION;
  if (type === 'row_version') return ROW_VERSION_OPTION;
  return DATETIME_OPTION;
}

/**
 * Incremental settings for Custom Query extraction.
 * Includes:
 * - Text input for incremental field (column name)
 * - Type selector (datetime/runningnumber/epoch/row_version)
 * - Type-specific value editors
 */
export function CustomQueryIncrementalSettings() {
  const {
    formApi,
    settingsPath,
    incrementalField,
    incrementalType,
    onIncrementalTypeChange,
  } = useCustomQueryExtraction();

  // Watch for source type to conditionally show row_version option
  const sourceName = useWatch({
    control: formApi.control,
    name: 'river.properties.source.name',
  });

  const selectedType = getSelectedTypeOption(incrementalType);
  const incrementalTypeOptions = getIncrementalTypeOptions(sourceName);

  return (
    <Flex flexDir="column" gap={4}>
      <Box>
        <Input
          label="Incremental Field"
          secondaryLabel="Enter the column name from your query to use for incremental extraction"
          placeholder="e.g. updated_at, id, created_date"
          name={`${settingsPath}.incremental_field`}
          api={formApi}
          chakra
        />
      </Box>

      <RenderGuard condition={Boolean(incrementalField)}>
        <Flex flexDir="column">
          <Flex gap={2}>
            <Box w={200}>
              <CustomSelectForm
                controlId="incremental_type"
                options={incrementalTypeOptions}
                label="Incremental Type"
                isMulti={false}
                value={selectedType}
                onChange={(option: { label: string; value: string }) =>
                  onIncrementalTypeChange(
                    option.value as CustomQueryIncrementalType,
                  )
                }
                size="sm"
              />
            </Box>
            <ValueInputsByType type={incrementalType} />
          </Flex>
          <AdditionalSettingsByType type={incrementalType} />
        </Flex>
      </RenderGuard>
    </Flex>
  );
}

/**
 * Renders the inline value inputs based on incremental type
 */
function ValueInputsByType({ type }: { type: CustomQueryIncrementalType }) {
  switch (type) {
    case 'datetime':
      return <DateTimeValueEditor />;
    case 'runningnumber':
      return <RunningNumberValueInputs />;
    case 'epoch':
      return <EpochValueEditor />;
    case 'row_version':
      return <RowVersionValueInputs />;
    default:
      return null;
  }
}

/**
 * Renders additional settings below the main row (e.g., Rows in Chunk for running number)
 */
function AdditionalSettingsByType({
  type,
}: {
  type: CustomQueryIncrementalType;
}) {
  switch (type) {
    case 'datetime':
      return <DateTimeAdvancedSettings />;
    case 'runningnumber':
      return <RowsInChunkSetting settingsKey="running_number" />;
    case 'row_version':
      return <RowsInChunkSetting settingsKey="row_version" />;
    default:
      return null;
  }
}

/**
 * DateTime value editor - uses DateTimePopover for date picking
 */
function DateTimeValueEditor() {
  const { formApi, dateRange, onDateRangeChange } = useCustomQueryExtraction();

  // Watch for source type to conditionally show round_up
  const sourceName = useWatch({
    control: formApi.control,
    name: 'river.properties.source.name',
  });

  // Check if current source supports round_up
  const showRoundUp = ROUND_UP_SUPPORTED_SOURCES.includes(
    sourceName as SourceTypes,
  );

  return (
    <Flex w="full" flexDir="column">
      <Text fontSize="xs">Start Date</Text>
      <DateTimePopover
        outerValue={(dateRange || {}) as DateRange}
        setValue={onDateRangeChange}
        showRoundUp={showRoundUp}
        onlyCustom
      />
    </Flex>
  );
}

/**
 * Advanced settings for DateTime incremental type
 */
function DateTimeAdvancedSettings() {
  const { formApi, settingsPath } = useCustomQueryExtraction();

  const timeIntervalPath = `${settingsPath}.date_range.split_time_intervals.time_interval`;
  const intervalSizePath = `${settingsPath}.date_range.split_time_intervals.interval_size`;
  const updateOnFailuresPath = `${settingsPath}.date_range.update_increment_on_failures`;

  useController({
    name: updateOnFailuresPath,
    control: formApi.control,
    defaultValue: false,
  });

  const selectedTimeInterval = formApi.watch(timeIntervalPath);
  const isChunkBySelected = !['dont_split', undefined].includes(
    selectedTimeInterval,
  );

  const selectedOption = chunkSizeOptions.find(
    opt => opt.value === selectedTimeInterval,
  );

  return (
    <Flex flexDir="column" gap={3} mt={4}>
      <RiverySwitch
        formControlStyle={{ alignItems: 'baseline' }}
        leftLabel
        ml="auto"
        label={
          <SwitchComplexLabel
            label="Update incremental date range also on failures"
            description={
              <Box>
                Data Flow will increment the start date even if the previous run
                failed. <strong>(Not recommended)</strong>
              </Box>
            }
          />
        }
        api={formApi}
        name={updateOnFailuresPath}
      />
      <Flex flexDir="column">
        <Text color="primary">Interval Chunks Size</Text>
        <CustomSelectForm
          options={chunkSizeOptions}
          defaultValue={chunkSizeOptions[0]}
          value={selectedOption}
          controlId="chunk_size"
          label="Split your loading data into several intervals in case of a large amount of returned data by:"
          isMulti={false}
          onChange={v =>
            formApi.setValue(
              timeIntervalPath,
              (v as Record<string, string>)?.value,
            )
          }
        />
      </Flex>
      <RenderGuard condition={isChunkBySelected}>
        <HStack>
          <Text color="font-secondary">Split Interval Size</Text>
          <Input type="number" api={formApi} name={intervalSizePath} min={1} />
        </HStack>
      </RenderGuard>
    </Flex>
  );
}

/**
 * Running number value inputs - start/end values (inline)
 */
function RunningNumberValueInputs() {
  const { formApi, settingsPath, runningNumber } = useCustomQueryExtraction();

  return (
    <Grid
      alignItems="start"
      gridTemplateColumns="180px min-content 180px"
      gap={1}
    >
      <Grid>
        <Input
          type="number"
          label="Start Value"
          placeholder="From Value.."
          name={`${settingsPath}.running_number.start_value`}
          api={formApi}
          chakra
          inputProps={{ min: 0 }}
        />
      </Grid>
      <Icon
        as={ArrowNarrowRight}
        display="flex"
        alignSelf="start"
        color="purple.100"
        boxSize="4"
        mt={7}
      />
      <Grid gap="2">
        <Input
          type="number"
          label="End Value"
          placeholder="Up to Value.."
          name={`${settingsPath}.running_number.end_value`}
          api={formApi}
          chakra
          inputProps={{ min: runningNumber?.start_value ?? 0 }}
        />
        <RiveryCheckbox
          api={formApi}
          name={`${settingsPath}.running_number.include_end_value`}
          label="Include End Value"
          isChecked={Boolean(runningNumber?.include_end_value)}
        />
      </Grid>
    </Grid>
  );
}

/**
 * Rows in Chunk setting for running number or row_version
 */
function RowsInChunkSetting({
  settingsKey,
}: {
  settingsKey: 'running_number' | 'row_version';
}) {
  const { formApi, settingsPath } = useCustomQueryExtraction();

  return (
    <Box w="200px">
      <Input
        type="number"
        label="Rows In Chunk"
        tooltip="Split your loading Data into several intervals in a case of large amount of returned Data. Leave empty for no splitting"
        name={`${settingsPath}.${settingsKey}.rows_in_chunk`}
        api={formApi}
        chakra
        inputProps={{ min: 1 }}
      />
    </Box>
  );
}

/**
 * Epoch value editor - start/end values
 */
function EpochValueEditor() {
  const { formApi, settingsPath, epoch } = useCustomQueryExtraction();

  return (
    <Grid
      alignItems="start"
      gridTemplateColumns="180px min-content 180px"
      gap={1}
    >
      <Grid>
        <Input
          type="number"
          label="Start Value"
          placeholder="From Value.."
          name={`${settingsPath}.epoch.start_value`}
          api={formApi}
          chakra
          inputProps={{ min: 0 }}
        />
      </Grid>
      <Icon
        as={ArrowNarrowRight}
        display="flex"
        alignSelf="start"
        color="purple.100"
        boxSize="4"
        mt={7}
      />
      <Grid gap="2">
        <Input
          type="number"
          label="End Value"
          placeholder="Up to Value.."
          name={`${settingsPath}.epoch.end_value`}
          api={formApi}
          chakra
          inputProps={{ min: epoch?.start_value ?? 0 }}
        />
        <RiveryCheckbox
          api={formApi}
          name={`${settingsPath}.epoch.include_end_value`}
          label="Include End Value"
        />
      </Grid>
    </Grid>
  );
}

/**
 * Row version value inputs - start/end values (inline)
 * Same as RunningNumberValueInputs but uses row_version key
 */
function RowVersionValueInputs() {
  const { formApi, settingsPath, rowVersion } = useCustomQueryExtraction();

  return (
    <Grid
      alignItems="start"
      gridTemplateColumns="180px min-content 180px"
      gap={1}
    >
      <Grid>
        <Input
          label="Start Value"
          placeholder="From Value.."
          name={`${settingsPath}.row_version.start_value`}
          api={formApi}
          chakra
          inputProps={{ min: 0 }}
        />
      </Grid>
      <Icon
        as={ArrowNarrowRight}
        display="flex"
        alignSelf="start"
        color="purple.100"
        boxSize="4"
        mt={7}
      />
      <Grid gap="2">
        <Input
          label="End Value"
          placeholder="Up to Value.."
          name={`${settingsPath}.row_version.end_value`}
          api={formApi}
          chakra
          inputProps={{ min: rowVersion?.start_value ?? 0 }}
        />
        <RiveryCheckbox
          api={formApi}
          name={`${settingsPath}.row_version.include_end_value`}
          label="Include End Value"
        />
      </Grid>
    </Grid>
  );
}
