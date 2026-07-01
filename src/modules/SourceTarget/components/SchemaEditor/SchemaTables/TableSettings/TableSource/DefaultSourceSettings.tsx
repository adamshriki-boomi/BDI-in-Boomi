import { Box, Flex, RenderGuard, Text } from 'components';
import { InputLabel } from 'components/Form';
import { IncrementColumn } from 'modules/SourceTarget/store';
import { compare } from 'utils/array.utils';
import {
  useTableDefinition,
  useTableSettings,
  useTableSettingsFormContext,
} from '../form.hooks';
import { CDCSettings } from './CDCSettings';
import { FilterExpression } from './FilterExpression';
import { StandardExtractionSettings } from './StandardExtractionSettings';
import { TableFilters } from './TableFilters';
import { useDataSourcesSections } from 'modules';
import { useGetRiverCommonProps } from 'modules/SourceTarget';
import { ExtractMethod } from 'api/types';
import RiveryAlert from 'components/Alert/Alert';

export function DefaultSettings({
  sourceDefinition,
  targetDefinition = null,
  additionalSourceSettingsTop = null,
  additionalSourceSettingsBottom = null,
}) {
  const { selectedDataSource } = useDataSourcesSections(
    'source',
    sourceDefinition.name,
  );
  const formApi = useTableSettingsFormContext();

  const { value: incColumns, update: addCustomColumn } =
    useTableDefinition<IncrementColumn[]>('increment_columns');
  const { value: incrementalField } = useTableSettings('incremental_field');
  const { value: extractMethod } = useTableSettings('extract_method');
  const selectedColumn = incColumns?.find(compare('name', incrementalField));
  //For custom increment we take value from the table - because it was initialy set on the table,
  //but for the inherited increment (the one that is not custom) we take it from the column for fallback
  const incrementalType =
    useTableSettings('incremental_type')?.value ??
    selectedColumn?.incremental_type;

  const isCustomColumn = Boolean(selectedColumn?.is_custom);
  const isExtractMethodIncremental =
    extractMethod === ExtractMethod.INCREMENTAL;
  const { isNotStandard } = useGetRiverCommonProps();
  const showFilterExpression =
    selectedDataSource?.feature_flags?.filter_expression !== false;

  const showExportChunkSize =
    selectedDataSource?.feature_flags?.export_chunk_size !== false;

  const showTableFilters = selectedDataSource?.feature_flags?.table_filters;

  const filterDescription =
    selectedDataSource?.feature_flags?.filter_expression_description;

  return (
    <Flex gap="1" maxW="900px" flexDir="column" h="full">
      <Text textStyle="R7" color="font-secondary">
        Set up the setting to your Source Data.
      </Text>
      <RenderGuard condition={additionalSourceSettingsTop}>
        {additionalSourceSettingsTop}
      </RenderGuard>
      <InputLabel variant="semibold" label="Extraction Method" />
      <RenderGuard
        condition={isNotStandard}
        fallback={
          <StandardExtractionSettings
            formApi={formApi}
            incColumns={incColumns}
            addCustomColumn={addCustomColumn}
            incrementalType={incrementalType}
            isCustomColumn={isCustomColumn}
            isExtractMethodIncremental={isExtractMethodIncremental}
            sourceDefinition={sourceDefinition}
            showExportChunkSize={showExportChunkSize}
          />
        }
      >
        <CDCSettings table={formApi} source={sourceDefinition} />
      </RenderGuard>
      <RenderGuard condition={showFilterExpression}>
        <FilterExpression formApi={formApi} />
        <RenderGuard condition={Boolean(filterDescription)}>
          <FilterDescriptionAlert description={filterDescription} />
        </RenderGuard>
      </RenderGuard>
      <RenderGuard condition={showTableFilters}>
        <TableFilters formApi={formApi} targetDefinition={targetDefinition} />
      </RenderGuard>
      <RenderGuard condition={additionalSourceSettingsBottom}>
        {additionalSourceSettingsBottom}
      </RenderGuard>
    </Flex>
  );
}

function FilterDescriptionAlert({ description }: { description: string }) {
  return (
    <Box mt={2} w="450px">
      <RiveryAlert
        variant="info"
        description={<div dangerouslySetInnerHTML={{ __html: description }} />}
      />
    </Box>
  );
}
