import { Flex } from '@chakra-ui/react';
import { TableType, TargetTypes } from 'api/types';
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
import { FormSelect, Input } from 'components/Form/components';
import { FormSection } from 'components/Form/FormSection';
import React from 'react';
import { LoadingMode } from '../RiverLogic/Logic/components/LoadingMode';
import { DropTableRiverEnds } from './components/';
import { ModalColumnsMapperController } from './components/ModalColumnsMapperController';
export function LogicTable({ useFormApi, onSubmitHandler, step }) {
  const formChanges = useFormApi.watch();
  const control = useFormApi.control;

  const tableTypeOptions = [
    {
      label: 'FACT',
      value: TableType.FACT,
    },
    {
      label: 'DIMENSION',
      value: TableType.DIMENSION,
    },
  ];

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FormSection title="Load Into">
          <Input
            name="content.target_table"
            label="Table Name"
            api={useFormApi}
          />
          <FormSelect
            label="Table Type"
            name="content.table_type"
            options={tableTypeOptions}
            controlId="table type"
            api={useFormApi}
            defaultValue={tableTypeOptions[0]}
          />
          <LoadingMode formChanges={formChanges} useFormApi={useFormApi} />
          <DropTableRiverEnds api={useFormApi} />
        </FormSection>
      </Flex>
      <ModalColumnsMapperController
        control={control}
        api={useFormApi}
        step={step}
        type={TargetTypes.FIREBOLT}
      />
    </form>
  );
}

export const types = [
  'STRING',
  'BOOLEAN',
  'BIGINT',
  'INT',
  'SMALLINT',
  'DOUBLE',
  'TIMESTAMP',
  'DATE',
];
export const defaultType = types[0];

export const LogicTargets = {
  Table: true,
  Variable: true,
  FileExport: false,
};
const isFact = whereClause => {
  return Boolean(whereClause?.content?.table_type !== 'DIMENSION');
};
export const mappingCols = {
  columns: [
    HeaderColumn,
    KeyColumn,
    TargetColumn,
    toTypeSelector({ repeat: true, typeOptions: types }),
    ModeSelectorColumn,
    {
      Header: 'Primary Index',
      Cell: MappingOrder,
      weight: 'max-content',
      accessor: 'id',
      styleProps: { justifyContent: 'center' },
    },
    {
      Header: 'Partition',
      accessor: 'partition',
      Cell: UniqueField,
      Condition: isFact,
    },
    {
      Header: 'Partition Expression',
      accessor: 'partition_expression',
      weight: 'minmax(auto, max-content)',
      Cell: EditableCell,
      placeholder: 'Partition Expression',
      Condition: isFact,
    },
    ExpressionColumn,
    AddChildColumn,
    RowActionsColumns,
  ],
};
