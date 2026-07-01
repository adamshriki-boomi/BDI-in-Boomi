import { MetadataType } from 'api/endpoints/metadata.api';
import {
  DistributionMethodTypes,
  FileCompressions,
  FileTypes,
  MergeMethods,
  TargetTypes,
} from 'api/types';
import { Box, Flex, HStack, RiveryButton } from 'components';
import {
  AddChildColumn,
  EditableCell,
  ExpressionColumn,
  HeaderColumn,
  KeyColumn,
  MappingOrder,
  RowActionsColumns,
  TargetColumn,
  toTypeSelector,
  UniqueField,
} from 'components/Form/columnsMapperConfig';
import {
  createOption,
  FormSelect,
  Input,
  Radio,
  RiverySwitch,
} from 'components/Form/components';
import { FormSection } from 'components/Form/FormSection';
import { FZBucket } from 'hooks/useFZBuckets';
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
export function LogicTable({ useFormApi, onSubmitHandler, step }) {
  const formChanges = useFormApi.watch();
  const control = useFormApi.control;

  const schemasResponse = useGetMetadataQuery(toMetaQueryConfig(step));

  const {
    content: { schema_id: schema },
  } = step;
  const selectedSchema = schema ? createOption(schema) : '';

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FormSection title="Load Into">
          <FormSelect
            label="Schema"
            name="content.schema_id"
            metadataResponse={schemasResponse}
            options={schemasResponse.data}
            isValidNewOption={isVariableString}
            controlId="schema_id"
            api={useFormApi}
            value={selectedSchema}
            editableCreate
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
            label="Distribution Method"
            name="content.distribution_method"
            options={distributionMethodOptions}
            defaultValue={distributionMethodOptions[0]}
            controlId="distribution method"
            api={useFormApi}
          />
          <LoadingMode
            formChanges={formChanges}
            useFormApi={useFormApi}
            mergeMethods={mergeMethods}
          />
          <DropTableRiverEnds api={useFormApi} />
        </FormSection>
      </Flex>
      <ModalColumnsMapperController
        control={control}
        api={useFormApi}
        step={step}
        onChange={updateDistMethod('key')}
        type={TargetTypes.REDSHIFT}
      />
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

export function LogicAdvancedOptions({ useFormApi }) {
  const linkUrl =
    'https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_VIEW.html#r_CREATE_VIEW_usage_notes';

  return (
    <>
      <RiverySwitch
        name="content.replace_cascade"
        label="Keep Schema-Binding Views"
        api={useFormApi}
      />
      <Box mt={1} fontSize="xs">
        <div>
          Keeping the entire schema binding views when using upsert-merge or
        </div>
        <div>
          Un-checking this option will <u>drop</u> any
          <RiveryButton
            size="small"
            label="Schema Binding Views"
            href={linkUrl}
            target="_blank"
            variant="link"
            mx={1}
          />
          depending on the target table.
        </div>
      </Box>
    </>
  );
}

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
    {
      label: 'AVRO',
      value: FileTypes.AVRO,
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
    {
      label: 'BZ2',
      value: FileCompressions.BZ2,
    },
    {
      label: 'GZIP',
      value: FileCompressions.ZST,
    },
  ];

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FZConnection blockType={content.block_type} useFormApi={useFormApi} />
        <FZBucket
          connId={getOId(content?.fzConnection)}
          dsId="s3"
          connectionType="aws"
          api={useFormApi}
        />
        <Input
          name="content.file_path_destination"
          label="File Name and File Path Destination"
          api={useFormApi}
        />

        <RiverySwitch
          name="content.load_into_one_file"
          label="Load into a single file"
          api={useFormApi}
        />

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
            <RiverySwitch
              name="content.csv_details.include_header"
              label="Include Header"
              api={useFormApi}
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
    label: 'Even',
    value: DistributionMethodTypes.EVEN,
  },
  {
    label: 'Key',
    value: DistributionMethodTypes.KEY,
  },
  {
    label: 'All',
    value: DistributionMethodTypes.ALL,
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
  'DATE',
  'TIMESTAMP',
  'JSON',
  'OBJECT',
  'SUPER',
];

export const defaultType = types[0];

export const defaultLengthByType = {
  INTEGER: 4,
  CHAR: 256,
  VARCHAR: 256,
};
export const defaultPrecisionByType = {
  DECIMAL: 18,
};
export const defaultScaleByType = {
  DECIMAL: 0,
};

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
        res['precision'] = defaultPrecisionByType[newType];
        res['scale'] = defaultScaleByType[newType];
        return res;
      },
    }),
    {
      Header: 'Length',
      accessor: 'length',
      Cell: EditableCell,
      type: 'number',
      isHidden: ({ getSortIndex }, { original }) => {
        return !defaultLengthByType.hasOwnProperty(original.type);
      },
    },
    {
      Header: 'Precision',
      accessor: 'precision',
      Cell: EditableCell,
      type: 'number',
      isHidden: ({ getSortIndex }, { original }) => {
        return !defaultPrecisionByType.hasOwnProperty(original.type);
      },
    },
    {
      Header: 'Scale',
      accessor: 'scale',
      Cell: EditableCell,
      type: 'number',
      isHidden: ({ getSortIndex }, { original }) => {
        return !defaultScaleByType.hasOwnProperty(original.type);
      },
    },

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
