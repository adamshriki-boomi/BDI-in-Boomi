import { Flex, RenderGuard, Textarea } from 'components';
import {
  CustomSelectForm,
  Input,
  InputLabel,
  InputTypes,
  RadioGroup,
} from 'components/Form';
import { useMultiLinerSelectStyles } from 'components/Form/components/SelectFormGroup/select.styles';
import ReloadTableMetadata from '../components/ReloadTableMetadata';
import { useTableSettings } from '../form.hooks';
import { DefaultSettings } from './DefaultSourceSettings';
import { Text } from '@chakra-ui/react';

const columnMappingOptions = {
  'Number Of Records': 'mapping_number_of_records',
  'Document Ids': 'mapping_documents_ids',
  'JSON Example': 'mapping_json_example',
};

const mappingOptions = Object.entries(columnMappingOptions).map(
  ([label, value]) => ({
    label,
    value,
    ariaLabel: `${label}-button`,
  }),
);

const maxRowsOptions = {
  'Dynamic Batch Size': 'dynamic',
  'Manual Batch Size': 'manual',
};

const rowsOptions = Object.entries(maxRowsOptions).map(([label, value]) => ({
  label,
  value,
  ariaLabel: `${label}-button`,
}));

export function MongoSettings({ sourceDefinition, targetDefinition }) {
  return (
    <DefaultSettings
      sourceDefinition={sourceDefinition}
      additionalSourceSettingsTop={
        <AdditionalSettings targetType={targetDefinition?.name} />
      }
    />
  );
}

function AdditionalSettings({ targetType }) {
  const { value: mapping_documents_ids, update: updateDocumentIds } =
    useTableSettings('additional_source_settings.mapping_documents_ids');

  const { value: mapping_settings_type, update: updateMappingSettingsType } =
    useTableSettings('additional_source_settings.mapping_settings_type');

  const { value: max_results_file, update: updateMaxResultsFile } =
    useTableSettings('additional_source_settings.max_results_file');

  const { value: chunk_size_type, update: updateChunkSizeType } =
    useTableSettings('additional_source_settings.chunk_size_type');

  const { value: mapping_num_of_records, update: updateMappingNumOfRecords } =
    useTableSettings('additional_source_settings.mapping_num_of_records');

  const { value: mapping_records_order, update: updateMappingRecordsOrder } =
    useTableSettings('additional_source_settings.mapping_records_order');

  const { value: json_example, update: updateJSONExample } = useTableSettings(
    'additional_source_settings.json_example',
  );

  const documentIds = (mapping_documents_ids as any[])?.map(value => ({
    value,
    label: value,
  }));
  const style = useMultiLinerSelectStyles();

  return (
    <Flex flexDir="column" w="450px" gap={3} pb={3}>
      <Flex flexDir="column" w="full" gap={3}>
        <InputLabel variant="semibold" label="Max Rows In Batch" />
        <RadioGroup
          name="max rows in batch"
          values={rowsOptions}
          checked={chunk_size_type as any}
          onChange={v => updateChunkSizeType(v)}
        />
        <RenderGuard
          condition={chunk_size_type === maxRowsOptions['Manual Batch Size']}
        >
          <Input
            type={InputTypes.NUMBER}
            chakra
            value={max_results_file}
            onChange={e => updateMaxResultsFile(e)}
            label="User defines a fixed chunk size. Requires careful sizing to avoid memory issues (minimum value is 100)."
            name="table.additional_source_settings.max_results_file"
            placeholder="Data Chunks"
            min={100}
            validationError={
              max_results_file < 100 ? 'Value must be at least 100' : null
            }
          />
        </RenderGuard>
        <RenderGuard
          condition={chunk_size_type === maxRowsOptions['Dynamic Batch Size']}
        >
          <Text textStyle="R8">
            Automatically adjust chunk size based on system memory to prevent
            runtime errors. Recommended for large datasets.
          </Text>
        </RenderGuard>
      </Flex>
      <Flex flexDir="column" gap={2}>
        <InputLabel variant="semibold" label="Columns Mapping Settings" />
        <RadioGroup
          label="Select the method you would like to map your table."
          name="columns mapping settings"
          values={mappingOptions}
          checked={mapping_settings_type as any}
          onChange={v => updateMappingSettingsType(v)}
        />
        <RenderGuard
          condition={
            mapping_settings_type === columnMappingOptions['Number Of Records']
          }
        >
          <Flex flexDir="column" gap={2}>
            <Input
              type={InputTypes.NUMBER}
              chakra
              label="Number of records to sample"
              name="table.additional_source_settings.mapping_num_of_records"
              value={mapping_num_of_records}
              onChange={e => updateMappingNumOfRecords(e)}
            />
            <CustomSelectForm
              isMulti={false}
              controlId="order sample"
              label="Records Order for Sample"
              name="table.additional_source_settings.mapping_records_order"
              options={orderSampleOptions}
              value={orderSampleOptions.find(
                opt => opt.value === mapping_records_order,
              )}
              onChange={v => updateMappingRecordsOrder((v as any).value)}
            />
          </Flex>
        </RenderGuard>
        <RenderGuard
          condition={
            mapping_settings_type === columnMappingOptions['Document Ids']
          }
        >
          <CustomSelectForm
            controlId="documentIds"
            withCreate
            options={documentIds}
            value={documentIds?.map(label => label)}
            onChange={(list: any) => {
              const documents_ids = list.map(({ value }) => value);
              updateDocumentIds(documents_ids);
            }}
            customStyles={style}
          />
        </RenderGuard>
        <RenderGuard
          condition={
            mapping_settings_type === columnMappingOptions['JSON Example']
          }
        >
          <Input
            chakra
            value={json_example}
            onChange={e => updateJSONExample(e.target.value)}
            label="JSON Example"
            name="table.additional_source_settings.json_example"
            as={Textarea}
          />
        </RenderGuard>
        <ReloadTableMetadata
          buttonProps={{ variant: 'outlined-default' }}
          successText="Metadata was successfully reloaded. Navigate to the schema mapping to view changes."
        />
      </Flex>
    </Flex>
  );
}

const orderSampleOptions = [
  { label: 'Last', value: 'Last' },
  { label: 'First', value: 'First' },
];
