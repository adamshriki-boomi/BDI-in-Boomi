import { DistributionMethodTypes, FileTypes, MergeMethods } from 'api/types';
import { Box, Flex, HStack } from 'components';
import {
  AddChildColumn,
  ExpressionColumn,
  HeaderColumn,
  KeyColumn,
  MappingOrder,
  ModeSelectorColumn,
  RowActionsColumns,
  TargetColumn,
  toTypeSelector,
} from 'components/Form/columnsMapperConfig';
import {
  FormSelect,
  Input,
  Radio,
  RiverySwitch,
} from 'components/Form/components';
import { FormSection } from 'components/Form/FormSection';
import React from 'react';
import { FZConnection } from '../RiverLogic/Logic/components/FilesExport';
import { LoadingMode } from '../RiverLogic/Logic/components/LoadingMode';
import { DropTableRiverEnds } from './components';
export function LogicTable({ onSubmitHandler, useFormApi }) {
  const formChanges = useFormApi.watch();

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FormSection title="Load Into">
          <Input name="content.database" label="Database" api={useFormApi} />
          <Input name="content.schema" label="Schema" api={useFormApi} />
          <Input
            name="content.target_table"
            label="Table Name"
            api={useFormApi}
          />
          <FormSelect
            label="Distribution Method"
            name="content.distribution_method"
            options={distributionMethodOptions}
            controlId="distribution method"
            api={useFormApi}
          />
          <LoadingMode formChanges={formChanges} useFormApi={useFormApi} />
          <DropTableRiverEnds api={useFormApi} />
        </FormSection>
      </Flex>
    </form>
  );
}

export function LogicFilesExport({ onSubmitHandler, useFormApi, content }) {
  const formChanges = useFormApi.watch();
  const showCsvInputs = formChanges.content.file_type === FileTypes.CSV;
  const showTxtInputs = formChanges.content.file_type === FileTypes.TXT;
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
      label: 'TXT',
      value: FileTypes.TXT,
    },
    {
      label: 'XML',
      value: FileTypes.XML,
    },
  ];

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FZConnection blockType={content.block_type} useFormApi={useFormApi} />
        <Input
          name="content.file_path_destination"
          label="File Name and File Path Destination"
          api={useFormApi}
        />

        <RiverySwitch
          name="content.load_into_one_file"
          my={3}
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

        {(showCsvInputs || showTxtInputs) && (
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
        {showTxtInputs && (
          <HStack gap={4}>
            <Input
              name="content.csv_details.row_delimiter"
              label="Row Delimiter"
              api={useFormApi}
            />
            <Input
              name="content.csv_details.quoting"
              label="Quoting"
              api={useFormApi}
            />
          </HStack>
        )}
      </Flex>
    </form>
  );
}

export function LogicAdvancedOptions({ useFormApi }) {
  return (
    <>
      <Input
        name="content.priority"
        label="Priority"
        defaultValue="1000"
        api={useFormApi}
        required
      />
      <Input
        name="content.parallelism"
        label="Parallelism"
        defaultValue="3"
        api={useFormApi}
        required
      />
    </>
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
    label: 'Range',
    value: DistributionMethodTypes.RANGE,
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
  'STRING',
  'INTEGER',
  'FLOAT',
  'BOOLEAN',
  'TIMESTAMP',
  'RECORD',
  'LONG',
];
export const defaultType = types[0];

export const mappingCols = {
  columns: [
    HeaderColumn,
    KeyColumn,
    TargetColumn,
    toTypeSelector({ typeOptions: types }),
    ModeSelectorColumn,
    {
      Header: 'Cluster Key',
      Cell: MappingOrder,
      weight: 'max-content',
      accessor: 'id',
      styleProps: { justifyContent: 'center' },
    },
    ExpressionColumn,
    AddChildColumn,
    RowActionsColumns,
  ],
};
