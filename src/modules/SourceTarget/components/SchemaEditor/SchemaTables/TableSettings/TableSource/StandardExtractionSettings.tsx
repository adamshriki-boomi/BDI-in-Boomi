import { Box, Flex, RenderGuard } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { Radio } from 'components/Form';
import {
  ExportChunkSize,
  ExportIncremental,
} from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/TableSource/SourceCommonSettings';
import { FormProvider, useController } from 'react-hook-form';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { useTableDefinition } from '../form.hooks';
import { AdvancedSettings } from '../components/IncrementalAdvancedSettings';
import { extractionMethods } from './ExtractMethods';

export function StandardExtractionSettings({
  formApi,
  incColumns,
  addCustomColumn,
  incrementalType,
  isCustomColumn,
  isExtractMethodIncremental,
  sourceDefinition,
  showExportChunkSize,
}) {
  useController({
    name: 'table.exporter_chunk_size',
    control: formApi.control,
    defaultValue: 30000,
  });
  const { value: incrementRequired } =
    useTableDefinition<boolean>('increment_required');
  return (
    <>
      <Box w="450px">
        <RiveryAlert
          icon={HiOutlineLightBulb}
          variant="info"
          title="Our Recommendation: Incremental Method"
          description="When dealing with large tables, it is highly recommended to perform incremental extractions."
        />
      </Box>
      <Flex flexDir="column" gap={4} w="450px">
        <RenderGuard condition={!incrementRequired}>
          <Box pt={2}>
            <Radio
              label="Pick the way you would like to extract data from your source."
              aria-label="extraction method"
              name="table.extract_method"
              api={formApi as any}
              defaultValue="all"
              values={extractionMethods}
            />
          </Box>
        </RenderGuard>
        <FormProvider {...formApi}>
          <RenderGuard
            condition={isExtractMethodIncremental || !!incrementRequired}
          >
            <ExportIncremental
              incColumns={incColumns}
              addCustomColumn={addCustomColumn}
              incrementalType={incrementalType}
              isCustomColumn={isCustomColumn}
            />
          </RenderGuard>
          <RenderGuard condition={showExportChunkSize}>
            <ExportChunkSize />
          </RenderGuard>
        </FormProvider>
      </Flex>
      <AdvancedSettings
        incrementalType={incrementalType}
        sourceDefinition={sourceDefinition}
      />
    </>
  );
}
