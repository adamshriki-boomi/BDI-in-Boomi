import { ExtractMethod, SourceTypes, storageTargets } from 'api/types';
import { Box, Flex, RenderGuard, Text } from 'components';
import { CustomSelectForm, Input, InputLabel } from 'components/Form';
import {
  CalculatedColumnMode,
  IModifiedColumn,
} from 'modules/SourceTarget/store';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import { compare } from 'utils/array.utils';
import {
  IncrementalFieldSelectController,
  IntervalFieldControl,
} from '../components';
import { useDataSourcesSections } from 'modules/Datasources';
import { useGetRiverCommonProps } from 'modules/SourceTarget';

const RowsInChunkInput = ({ formApi }) => {
  const currentValue = formApi.watch('table.running_number.rows_in_chunk');

  useEffect(() => {
    if (currentValue === 0 || currentValue == null) {
      formApi.setValue('table.running_number.rows_in_chunk', 100000, {
        shouldDirty: false,
      });
    }
  }, [currentValue, formApi]);

  return (
    <Box>
      <Text textStyle="R7" color="primary">
        Rows In Chunk
      </Text>
      <Input
        type="number"
        label="Split your loading Data into several intervals in a case of large amount of returned Data."
        placeholder="0"
        name="table.running_number.rows_in_chunk"
        api={formApi}
        chakra
      />
    </Box>
  );
};

export const ExportIncremental = ({
  incColumns,
  addCustomColumn,
  incrementalType,
  includeChunkSize = true,
  isLoading = false,
  isCustomColumn = false,
  bulk = false,
}) => {
  const formApi = useFormContext();
  const { field: incrementalField } = useController({
    name: 'table.incremental_field',
    control: formApi.control,
  });
  const extractMethod = useWatch({
    control: formApi.control,
    name: 'table.extract_method',
  });

  useEffect(() => {
    if (extractMethod !== ExtractMethod.INCREMENTAL || incrementalField.value)
      return;
    const autoColumn =
      incColumns?.length === 1
        ? incColumns[0]
        : incColumns?.find(col => col.is_default);
    if (!autoColumn) return;
    incrementalField.onChange(autoColumn.name);
    const incType = incColumns?.find(
      compare('name', autoColumn.name),
    )?.incremental_type;
    if (incType) formApi.setValue('table.incremental_type', incType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractMethod]);

  return (
    <Flex flexDir="column" gap={4}>
      <Flex w={450}>
        <IncrementalFieldSelectController
          options={incColumns}
          addCustomColumn={addCustomColumn}
          selectValueFn={value => incColumns?.find(compare('name', value))}
          formApi={formApi}
          isLoading={isLoading}
          incColumns={incColumns}
        />
      </Flex>
      <RenderGuard condition={Boolean(incrementalField.value)}>
        <IntervalFieldControl
          type={incrementalType}
          formApi={formApi}
          isCustomColumn={isCustomColumn}
          bulk={bulk}
        />
      </RenderGuard>
      <RenderGuard
        condition={incrementalType === 'runningnumber' && includeChunkSize}
      >
        <RowsInChunkInput formApi={formApi} />
      </RenderGuard>
    </Flex>
  );
};

export const ExportChunkSize = () => {
  const formApi = useFormContext();
  const source = formApi.watch('definitions.database_properties.type');
  if (source === SourceTypes.MONGO) {
    return; //mongo doesn't support chunk size
  }
  return (
    <Box pt={2}>
      <InputLabel label="Exporter Chunk Size" variant="semibold" />
      <Input
        type="number"
        hideLabel
        secondaryLabel="Define the size of data chunks to be exported. Adjusting the chunk size helps optimize performance and manage memory usage during the export process."
        placeholder="0"
        name="table.exporter_chunk_size"
        api={formApi}
        chakra
      />
    </Box>
  );
};

export function ExpressionTypeSelect({
  isDisabled = false,
  defaultValue = 'target' as CalculatedColumnMode,
}) {
  const formMethods = useFormContext<IModifiedColumn>();

  useController({
    name: 'calculated_column_mode',
    control: formMethods.control,
    defaultValue,
  });

  const expressionTypes = [
    { label: 'Target Expression', value: 'target' },
    { label: 'Source Expression', value: 'source' },
  ];

  return (
    <CustomSelectForm
      options={expressionTypes}
      controlId="expression-select"
      isMulti={false}
      label="Calculated Column Expression Type"
      name="calculated_column_mode"
      api={formMethods}
      isDisabled={isDisabled}
    />
  );
}

export function useHandleCalculatedExpressions(source, target) {
  const { selectedDataSource } = useDataSourcesSections('source', source);
  const { isCDC } = useGetRiverCommonProps();
  const isStorage = storageTargets.includes(target);

  const hasTargetColumns = !isStorage;
  const hasSourceColumns =
    selectedDataSource?.feature_flags?.source_calculated_columns && !isCDC;
  const shouldShowCalculatedColumn = hasTargetColumns || hasSourceColumns;

  const isDisabled = !hasTargetColumns || !hasSourceColumns;
  const defaultValue: CalculatedColumnMode = hasTargetColumns
    ? 'target'
    : 'source';

  return {
    isDisabled,
    defaultValue,
    hasTargetColumns,
    hasSourceColumns,
    shouldShowCalculatedColumn,
  };
}
