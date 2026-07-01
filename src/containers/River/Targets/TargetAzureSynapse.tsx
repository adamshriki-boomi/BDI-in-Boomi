import { MetadataType } from 'api/endpoints/metadata.api';
import {
  DistributionMethodTypes,
  FileCompressions,
  FileTypes,
  MergeMethods,
  TableType,
  TargetTypes,
} from 'api/types';
import { Box, Flex, HStack } from 'components';
import {
  AddChildColumn,
  EditableCell,
  ExpressionColumn,
  HeaderColumn,
  KeyColumn,
  MappingOrder,
  ModeSelectorColumn,
  RowActionsColumns,
  TargetColumn,
  toTypeSelector,
  UniqueField,
} from 'components/Form/columnsMapperConfig';
import {
  FormSelect,
  Input,
  Radio,
  RiverySwitch,
} from 'components/Form/components';
import { FormSection } from 'components/Form/FormSection';
import React from 'react';
import { useGetMetadataQuery } from 'store/metadata';
import { CallType } from 'store/river/hooks/useRiverForMetadataCall';
import { getOId } from 'utils/api.sanitizer';
import { isVariableString } from '../hooks/useAsyncMetadata';
import { FZConnection } from '../RiverLogic/Logic/components/FilesExport';
import { LoadingMode } from '../RiverLogic/Logic/components/LoadingMode';
import { DropTableRiverEnds } from './components/';
import {
  ModalColumnsMapperController,
  updateDistMethod,
} from './components/ModalColumnsMapperController';
export const defaultLengthByType = {
  VARCHAR: 256,
};
export function LogicTable({ useFormApi, onSubmitHandler, step }) {
  const formChanges = useFormApi.watch();
  const control = useFormApi.control;

  const schemasResponse = useGetMetadataQuery(toMetaQueryConfig(step));

  const {
    content: { schema_id: schema },
  } = step;
  const selectedSchema = schema ? { value: schema, label: schema } : '';

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FormSection title="Load Into">
          <FormSelect
            label="Schema"
            name="content.schema_id"
            options={schemasResponse.data}
            metadataResponse={schemasResponse}
            isValidNewOption={isVariableString}
            controlId="schema_id"
            api={useFormApi}
            value={selectedSchema}
            defaultCreateLabel=""
            placeholder="Select schema or use a variable"
            hideErrorTitle
            isClearable
          />
          <Input
            name="content.target_table"
            label="Table Name"
            api={useFormApi}
            placeholder="Define table name or use a variable"
          />
          <FormSelect
            label="Table Type"
            name="content.table_type"
            options={tableTypeOptions}
            controlId="table type"
            api={useFormApi}
            defaultValue={tableTypeOptions[0]}
          />
          <FormSelect
            label="Distribution Method"
            name="content.distribution_method"
            options={distributionMethodOptions}
            controlId="distribution method"
            api={useFormApi}
            defaultValue={distributionMethodOptions[0]}
          />
          <LoadingMode formChanges={formChanges} useFormApi={useFormApi} />
          <DropTableRiverEnds api={useFormApi} />
          <ModalColumnsMapperController
            control={control}
            api={useFormApi}
            step={step}
            onChange={updateDistMethod('hash')}
            type={TargetTypes.AZURE_SQL_DWH}
          />
        </FormSection>
      </Flex>
    </form>
  );
}

export const toMetaQueryConfig = (step: any) => {
  return {
    id: getOId(step.content?.gConnection),
    step,
    type: MetadataType.SCHEMAS,
    callType: CallType.LOGIC,
  };
};

export function LogicFilesExport({ onSubmitHandler, useFormApi, content }) {
  const formChanges = useFormApi.watch();
  const showCsvInputs = formChanges.content.file_type === FileTypes.CSV;
  const showCompression = formChanges.content.file_type !== FileTypes.AVRO;
  const fileTypeOptions = [
    {
      label: 'CSV',
      value: FileTypes.CSV,
    },
    {
      label: 'JSON',
      value: FileTypes.JSON,
      disabled: true,
    },
  ];

  const compressionOptions = [
    {
      label: 'None',
      value: FileCompressions.NONE,
    },
    {
      label: 'GZIP',
      value: FileCompressions.GZIP,
    },
  ];

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FZConnection blockType={content.block_type} useFormApi={useFormApi} />
        <Input
          name="content.bucket_name"
          label="Container Name"
          api={useFormApi}
          placeholder="Define bucket name or use a variable"
        />
        <Input
          name="content.file_path_destination"
          label="File Name and File Path Destination"
          api={useFormApi}
        />
        <Box my={3}>
          <RiverySwitch
            name="content.load_into_one_file"
            label="Load into a single file"
            api={useFormApi}
          />
        </Box>
        <Box mb={2}>
          <Radio
            label="File Type"
            name="content.file_type"
            values={fileTypeOptions}
            api={useFormApi}
          />
        </Box>

        {showCsvInputs && (
          <HStack gap={4}>
            <Input
              name="content.csv_details.delimiter"
              label="Field Delimiter"
              api={useFormApi}
              defaultValue=","
            />
            <Input
              name="content.csv_details.quote"
              label="Quote Char"
              api={useFormApi}
              defaultValue='"'
            />
          </HStack>
        )}

        {showCompression && (
          <Box ml={2} mb={2}>
            <Radio
              label="Compression"
              name="content.compression"
              values={compressionOptions}
              api={useFormApi}
            />
          </Box>
        )}
      </Flex>
    </form>
  );
}

export const distributionMethodOptions = [
  {
    label: 'Round Robin',
    value: DistributionMethodTypes.ROUND_ROBIN,
  },
  {
    label: 'Hash',
    value: DistributionMethodTypes.HASH,
  },
  {
    label: 'Replicate',
    value: DistributionMethodTypes.REPLICATE,
  },
];
export const tableTypeOptions = [
  {
    label: 'Columnstore',
    value: TableType.COLUMNSTORE,
  },
  {
    label: 'Rowstore',
    value: TableType.ROWSTORE,
  },
];

export const mergeMethods = [
  {
    label: 'Switch - Merge',
    value: MergeMethods.SWITCH_TABLES,
  },
  {
    label: 'Delete - Insert',
    value: MergeMethods.DELETE_INSERT,
  },
  {
    label: 'Merge',
    value: MergeMethods.MERGE,
  },
];
export const types = [
  'VARCHAR',
  'INTEGER',
  'FLOAT',
  'BIGINT',
  'SMALLINT',
  'DECIMAL',
  'REAL',
  'DOUBLE PRECISION',
  'BOOLEAN',
  'CHAR',
  'NVARCHAR',
  'DATE',
  'TIMESTAMP',
  'OBJECT',
  'VARIANT',
];
export const defaultType = types[0];

export const mappingCols = {
  columns: [
    HeaderColumn,
    KeyColumn,
    TargetColumn,
    toTypeSelector({
      repeat: true,
      repeatLabel: 'varchar',
      typeOptions: types,
      onChange: newType => {
        const res = {};
        res['length'] = defaultLengthByType[newType];
        return res;
      },
    }),
    {
      Header: 'Length',
      accessor: 'length',
      Cell: EditableCell,
      type: 'number',
      isHidden: ({ getSortIndex }, { original }) => {
        return !defaultLengthByType[original.type];
      },
    },
    ModeSelectorColumn,
    {
      Header: 'Sort',
      Cell: MappingOrder,
      weight: 'max-content',
      accessor: 'id',
      styleProps: { justifyContent: 'center' },
    },
    {
      Header: 'Dist',
      accessor: 'dist',
      Cell: UniqueField,
    },
    ExpressionColumn,
    AddChildColumn,
    RowActionsColumns,
  ],
};
