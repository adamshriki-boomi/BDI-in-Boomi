import { Flex } from '@chakra-ui/react';
import { RiveryRadioGroup } from 'components/Form/components/RiveryRadioGroup';
import { useController, useFormContext } from 'react-hook-form';
import * as React from 'react';
import {
  BulkExtractMethodStandardLabels,
  BulkExtractMethodStandardValues,
} from '../../consts';
import { InfoTooltip, Text } from 'components';
import { ExportIncremental } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/TableSource/SourceCommonSettings';
import { useBulkActionsSchema } from '../../hooks';
import { DateTimePopover } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/components/DateTimePopover';
import {
  useTableDefinition,
  useTableSettings,
} from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/form.hooks';
import { compare } from 'utils/array.utils';
import RiveryAlert from 'components/Alert/Alert';
import {
  IncrementColumn,
  IRiverExtractMethod,
} from 'modules/SourceTarget/store';
import { useGetRiverCommonProps } from 'modules/SourceTarget';
import { useToastComponent } from 'hooks/useToast';

const WARN_SET_ALL =
  'At least one of the selected tables requires incremental extraction and cannot be set to "All".';
const WARN_SET_INCREMENTAL =
  'At least one of the selected tables does not support incremental extraction and cannot be set to "Incremental".';

export const BulkStandardExtractionMode = () => {
  const formApi = useFormContext();
  const { field: extractMethod } = useController({
    name: 'actions.extractMethod',
    control: formApi.control,
  });
  const { selectedRiverExtractMethod } = useGetRiverCommonProps();
  const { field: timePeriod } = useController({
    name: 'actions.timePeriod',
    control: formApi.control,
    defaultValue: null,
  });

  const { jointColumns, trigger, isLoading } = useBulkActionsSchema(formApi);
  const { warning } = useToastComponent();

  function warnIfConflict(option) {
    const tables = (formApi.getValues('actions.bulkTablesData') ?? []).flat();
    const isConflict =
      (option === BulkExtractMethodStandardValues.ALL &&
        tables.some(t => t?.increment_required)) ||
      (option === BulkExtractMethodStandardValues.INCREMENTAL &&
        tables.some(t => t?.no_increment));
    if (isConflict) {
      warning({
        duration: 30000,
        title: 'Warning',
        description:
          option === BulkExtractMethodStandardValues.ALL
            ? WARN_SET_ALL
            : WARN_SET_INCREMENTAL,
      });
    }
  }
  const values = [
    {
      show: [IRiverExtractMethod.SYSTEM_VERSIONING, IRiverExtractMethod.ALL],
      label: BulkExtractMethodStandardLabels.KEEP,
      value: BulkExtractMethodStandardValues.KEEP,
      description:
        'Retain the existing extraction settings without making any changes.',
    },
    {
      show: [IRiverExtractMethod.ALL],
      label: BulkExtractMethodStandardLabels.ALL,
      ariaLabel: 'Set to All',
      value: BulkExtractMethodStandardValues.ALL,
      description: 'Extract all available data from the source.',
    },
    {
      show: [IRiverExtractMethod.ALL],
      label: BulkExtractMethodStandardLabels.INCREMENTAL,
      value: BulkExtractMethodStandardValues.INCREMENTAL,
      description:
        'Select the incremental field and set ‘Start to end’ values for all tables.',
      content: (
        <IncrementalContent jointColumns={jointColumns} isLoading={isLoading} />
      ),
    },
    {
      show: [IRiverExtractMethod.SYSTEM_VERSIONING, IRiverExtractMethod.ALL],
      label: BulkExtractMethodStandardLabels.TIME,
      value: BulkExtractMethodStandardValues.TIME,
      description:
        'Specify the time range for which data should be retrieved or updated.',
      content: (
        <DateTimePopover
          setValue={timePeriod.onChange}
          outerValue={timePeriod.value}
        />
      ),
    },
  ].filter(({ show }) => {
    return show?.includes(
      selectedRiverExtractMethod || IRiverExtractMethod.ALL,
    );
  });

  return (
    <Flex w="450px" position="relative" direction="column" gap={2}>
      <Flex direction="column">
        <Text textStyle="M6" color="primary">
          Extraction Mode Settings
        </Text>
        <Text textStyle="R7" color="font-secondary">
          Select the action to extract data from your source:
        </Text>
      </Flex>
      <RiveryRadioGroup
        defaultValue={extractMethod.value}
        onChange={async option => {
          extractMethod.onChange(option);
          await trigger();
          warnIfConflict(option);
        }}
        value={extractMethod.value}
        values={values}
      />
    </Flex>
  );
};

export const BulkSystemVersioningExtractionMode = () => {
  const formApi = useFormContext();
  const { field: timePeriod } = useController({
    name: 'actions.timePeriod',
    control: formApi.control,
    defaultValue: null,
  });

  return (
    <Flex w="450px" position="relative" direction="column" gap={2}>
      <Flex direction="column">
        <Text textStyle="M6" color="primary">
          Set the date range
        </Text>
      </Flex>
      <DateTimePopover
        setValue={timePeriod.onChange}
        outerValue={timePeriod.value}
      />
    </Flex>
  );
};

const IncrementalContent = ({ jointColumns, isLoading }) => {
  return (
    <Flex direction="column" gap={2}>
      <BulkIncrementalStartToEnd
        jointColumns={jointColumns}
        isLoading={isLoading}
      />
      <RiveryAlert
        variant="warning-light"
        icon={InfoTooltip}
        description="In case a custom column is selected, the incremental field will be applied to the tables without verifying whether it exists."
      />
    </Flex>
  );
};

const BulkIncrementalStartToEnd = ({ jointColumns, isLoading }) => {
  const incColumns = jointColumns();
  const { value: customIncColumns, update: addCustomColumn } =
    useTableDefinition<IncrementColumn[]>('increment_columns');
  const { value: incrementalField } = useTableSettings('incremental_field');
  const incrementalType = incColumns?.find(
    compare('name', incrementalField),
  )?.incremental_type;
  const isCustomColumn =
    customIncColumns?.length > 0 &&
    incColumns?.every(col => col.name !== incrementalField);
  const options = customIncColumns?.length > 0 ? customIncColumns : incColumns;
  return (
    <ExportIncremental
      incColumns={options}
      addCustomColumn={addCustomColumn}
      incrementalType={incrementalType}
      includeChunkSize={false}
      isLoading={isLoading}
      isCustomColumn={isCustomColumn}
      bulk
    />
  );
};
