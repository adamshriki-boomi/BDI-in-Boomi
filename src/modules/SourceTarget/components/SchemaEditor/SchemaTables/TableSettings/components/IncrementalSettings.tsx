import {
  Flex,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverFooter,
  PopoverHeader,
  PopoverProps,
  Portal,
  useDisclosure,
} from '@chakra-ui/react';
import { IncrementalType } from 'api/types';
import {
  Box,
  HStack,
  PopoverContent,
  PopoverTrigger,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { CustomSelectForm, Input, InputLabel } from 'components/Form';
import { DateRange } from 'modules/SourceTarget/store';
import { useCallback, useEffect, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { compare } from 'utils/array.utils';
import { DateTimeEditor, dateRangeOptions } from './DateTimeEditor';
import { formatInTimeZone } from 'date-fns-tz';

const incrementalTypeOptions = [
  { label: 'Timestamp', value: IncrementalType.DATETIME },
  { label: 'Running Number', value: IncrementalType.RUNNING_NUMBER },
];

interface IncrementalSettingsProps {
  /**
   * Base path for form fields.
   * Fields will be: `${basePath}.incremental_field`, `${basePath}.incremental_type`, `${basePath}.date_range`
   */
  basePath: string;
  /** Optional: Description text below the input */
  description?: string;
}

/**
 * Reusable incremental settings component with text input for field name.
 * Use this for contexts where column metadata is not available (like custom query).
 *
 * For table settings with column dropdown, use the existing ExportIncremental component instead.
 */
export function IncrementalSettings({
  basePath,
  description = 'Please select or type an incremental field. For custom column name, type its name exactly as it appears in the schema',
}: IncrementalSettingsProps) {
  const formApi = useFormContext();

  const { field: incrementalFieldControl } = useController({
    name: `${basePath}.incremental_field`,
    control: formApi.control,
  });

  const { field: incrementalTypeControl } = useController({
    name: `${basePath}.incremental_type`,
    control: formApi.control,
  });

  const { field: dateRangeControl } = useController({
    name: `${basePath}.date_range`,
    control: formApi.control,
  });

  const incrementalField = incrementalFieldControl.value;
  const incrementalType = incrementalTypeControl.value;

  return (
    <Flex flexDir="column" gap={4}>
      {/* Incremental Field - Text input */}
      <Box>
        <InputLabel label="Incremental Field" variant="semibold" />
        <Text textStyle="R7" color="font-secondary" mb={2}>
          {description}
        </Text>
        <Input
          placeholder="Enter incremental field name"
          name={`${basePath}.incremental_field`}
          api={formApi}
          chakra
        />
      </Box>

      {/* Incremental Type and Start Date - only show when field is selected */}
      <RenderGuard condition={Boolean(incrementalField)}>
        <HStack alignItems="flex-start">
          <Box flex={1}>
            <CustomSelectForm
              options={incrementalTypeOptions}
              controlId="incremental-type-select"
              isMulti={false}
              label="Incremental Type"
              name={`${basePath}.incremental_type`}
              api={formApi}
            />
          </Box>
          <RenderGuard condition={incrementalType === IncrementalType.DATETIME}>
            <Box flex={1}>
              <InputLabel label="Start Date" />
              <DateTimePopoverControlled
                value={dateRangeControl.value}
                onChange={dateRangeControl.onChange}
              />
            </Box>
          </RenderGuard>
        </HStack>
      </RenderGuard>
    </Flex>
  );
}

/**
 * Path-configurable DateTime popover component.
 * Uses the same DateTimeEditor UI but works with controlled value/onChange props.
 */
interface DateTimePopoverControlledProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  placement?: PopoverProps['placement'];
}

function DateTimePopoverControlled({
  value,
  onChange,
  placement = 'top',
}: DateTimePopoverControlledProps) {
  const { onOpen, onClose, isOpen } = useDisclosure();

  return (
    <Popover
      isLazy
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      size="xl"
      placement={placement}
      modifiers={[
        {
          name: 'flip',
          enabled: false,
        },
      ]}
    >
      <PopoverTrigger>
        <Input
          label="timestamp"
          hideLabel
          placeholder="Select Date"
          value={resolveDateValue(value, '')}
          readOnly
          chakra
        />
      </PopoverTrigger>
      <Portal>
        <Flex
          sx={{
            '.chakra-popover__popper': { zIndex: 'popover' },
          }}
        >
          <DateTimePopoverContent
            value={value}
            update={onChange}
            onClose={onClose}
          />
        </Flex>
      </Portal>
    </Popover>
  );
}

function DateTimePopoverContent({ value, update, onClose }) {
  const [draft, setDraft] = useState<DateRange>(value);

  useEffect(() => {
    if (draft !== value) {
      setDraft({ ...value });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onCancel = useCallback(() => {
    setDraft(value);
    onClose();
  }, [onClose, value]);

  return (
    <PopoverContent
      width="1000px"
      aria-label="time period popover"
      bg="white!important"
      border="1px solid"
      borderColor="border"
      zIndex={100000}
    >
      <PopoverCloseButton />
      <PopoverHeader textStyle="M6">Time Period</PopoverHeader>
      <PopoverBody
        overflow="auto"
        paddingInline="6"
        paddingBlock="6"
        display="flex"
        flexDir="column"
        gap={4}
      >
        <DateTimeEditor value={draft ?? value} onChange={setDraft} />
      </PopoverBody>
      <PopoverFooter px="4">
        <Flex justifyContent="end" gap={2}>
          <RiveryButton
            label="Cancel"
            size="small"
            variant="default"
            onClick={onCancel}
          />
          <RiveryButton
            label="Apply Changes"
            size="small"
            variant="primary"
            isDisabled={!Boolean(draft)}
            onClick={() => {
              if (draft) {
                update(draft);
                onClose();
                setDraft(undefined);
              }
            }}
          />
        </Flex>
      </PopoverFooter>
    </PopoverContent>
  );
}

const resolveDateValue = (date: DateRange, fallback: string) => {
  if (!date) return fallback;

  const isCustom = date?.time_period === 'custom';

  const formatDateUTC = (dateValue: string) => {
    if (!dateValue) return '';
    const d = new Date(dateValue);
    return formatInTimeZone(d, 'UTC', 'dd-MMM-yy, HH:mm:ss');
  };

  return isCustom
    ? [date?.start_date, date?.end_date]
        .filter(Boolean)
        .map(value => formatDateUTC(value))
        .join(' ⇀ ')
    : date?.time_period
    ? (Object.values(dateRangeOptions) as any)
        .flat(Infinity)
        .find(compare('value', date?.time_period))?.label
    : fallback;
};

interface ChunkSizeInputProps {
  name: string;
}

/**
 * Reusable chunk size input component.
 */
export function ChunkSizeInput({ name }: ChunkSizeInputProps) {
  const formApi = useFormContext();

  useController({
    name,
    control: formApi.control,
    defaultValue: 300000,
  });

  return (
    <Box pt={2}>
      <Input
        type="number"
        label="Exporter Chunk Size"
        secondaryLabel="Define the size of data chunks to be exported. Adjusting the chunk size helps optimize performance and manage memory usage during the export process."
        placeholder="0"
        name={name}
        api={formApi}
        chakra
      />
    </Box>
  );
}

interface FilterExpressionInputProps {
  /** Full path to the filter expression field */
  name: string;
  /** Label for the input */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Reusable filter expression input component.
 */
export function FilterExpressionInput({
  name,
  label = 'Filters',
  placeholder = 'Enter Filter Expression',
}: FilterExpressionInputProps) {
  const formApi = useFormContext();

  return (
    <Box>
      <InputLabel variant="semibold" label={label} />
      <Input
        as="textarea"
        hideLabel
        placeholder={placeholder}
        name={name}
        api={formApi}
        chakra
        size="10"
        fontSize="sm"
        optional
      />
    </Box>
  );
}
