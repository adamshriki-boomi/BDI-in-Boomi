import { Flex, RenderGuard, Spinner, Text } from 'components';
import { InputLabel } from 'components/Form';
import { IncrementColumn } from 'modules/SourceTarget/store';
import { compare } from 'utils/array.utils';
import { ExtractMethod } from 'api/types';
import { GenericUIField } from './GenericForm';
import {
  useTableDefinition,
  useTableSettings,
  useTableSettingsFormContext,
} from '../form.hooks';
import { useGetDatasourcePropertiesQuery } from './genericSourceSettings.api';
import { StandardExtractionSettings } from './StandardExtractionSettings';
export function GenericSourceSettings({ sourceDefinition, targetDefinition }) {
  const formMethods = useTableSettingsFormContext();
  const datasourceId = sourceDefinition?.name;

  const { value: incColumns, update: addCustomColumn } =
    useTableDefinition<IncrementColumn[]>('increment_columns');
  const { value: noIncrement } = useTableDefinition<boolean>('no_increment');
  const { value: incrementalField } = useTableSettings('incremental_field');
  const { value: extractMethod } = useTableSettings('extract_method');
  const selectedColumn = incColumns?.find(compare('name', incrementalField));
  const incrementalType =
    useTableSettings('incremental_type')?.value ??
    selectedColumn?.incremental_type;
  const isCustomColumn = Boolean(selectedColumn?.is_custom);
  const isExtractMethodIncremental =
    extractMethod === ExtractMethod.INCREMENTAL;

  const definitions = (formMethods?.watch('definitions') ?? {}) as Record<
    string,
    any
  >;
  const queryParams = {
    datasourceId,
    ...definitions,
    ...(definitions['id'] ? { report: definitions['id'] } : {}),
    ...(definitions['schema_name']
      ? { schema: definitions['schema_name'] }
      : {}),
  };
  const { data, isLoading } = useGetDatasourcePropertiesQuery(queryParams, {
    skip: !datasourceId,
  });

  const inputs = data?.inputs ?? [];
  const connectionId = formMethods?.watch('connectionId');
  const pullRequestContext =
    connectionId && datasourceId
      ? {
          connectionId,
          datasourceId,
          ...definitions,
          ...(definitions['id'] ? { report: definitions['id'] } : {}),
          ...(definitions['schema_name']
            ? { schema: definitions['schema_name'] }
            : {}),
        }
      : undefined;

  return (
    <Flex gap="1" maxW="900px" flexDir="column" h="full">
      <Text textStyle="R7" color="font-secondary">
        Set up the setting to your Source Data.
      </Text>
      <Flex flexDir="column" gap={2} w="450px">
        {isLoading && <Spinner size="sm" color="brand" />}
        {inputs.map((input, index) => (
          <GenericUIField
            key={`${input.name ?? input.type}-${index}`}
            input={input}
            pullRequestContext={pullRequestContext}
          />
        ))}
      </Flex>
      <RenderGuard condition={!noIncrement}>
        <InputLabel variant="semibold" label="Extraction Method" />
        <StandardExtractionSettings
          formApi={formMethods}
          incColumns={incColumns}
          addCustomColumn={addCustomColumn}
          incrementalType={incrementalType}
          isCustomColumn={isCustomColumn}
          isExtractMethodIncremental={isExtractMethodIncremental}
          sourceDefinition={sourceDefinition}
          showExportChunkSize={false}
        />
      </RenderGuard>
    </Flex>
  );
}
