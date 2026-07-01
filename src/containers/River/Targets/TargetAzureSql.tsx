import { Flex } from '@chakra-ui/react';
import { MetadataType } from 'api/endpoints/metadata.api';
import { MergeMethods, TargetTypes } from 'api/types';
import {
  AddChildColumn,
  EditableCell,
  ExpressionColumn,
  HeaderColumn,
  KeyColumn,
  ModeSelectorColumn,
  RowActionsColumns,
  TargetColumn,
  toTypeSelector,
} from 'components/Form/columnsMapperConfig';
import { Input } from 'components/Form/components';
import { SelectSingleLogicApi } from 'components/Form/components/SelectFormGroup/SelectSingleLogicApi';
import { FormSection } from 'components/Form/FormSection';
import React from 'react';
import { CallType } from 'store/river/hooks/useRiverForMetadataCall';
import { getOId } from 'utils/api.sanitizer';
import { FZConnection } from '../RiverLogic/Logic/components/FilesExport';
import { LoadingMode } from '../RiverLogic/Logic/components/LoadingMode';
import { DropTableRiverEnds } from './components/';
import { ModalColumnsMapperController } from './components/ModalColumnsMapperController';
export function LogicFilesExport({ useFormApi, content, onSubmitHandler }) {
  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FZConnection blockType={content.block_type} useFormApi={useFormApi} />
        <Input
          name="content.bucket_name"
          label="Bucket Name"
          api={useFormApi}
          placeholder="Define bucket name or use a variable"
        />
        <Input
          name="content.file_path_destination"
          label="File Name and File Path Destination"
          api={useFormApi}
        />
      </Flex>
    </form>
  );
}

export function LogicTable({ useFormApi, onSubmitHandler, step }) {
  const formChanges = useFormApi.watch();
  const control = useFormApi.control;

  const {
    content: { schema_id: schema },
  } = step;

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FormSection title="Load Into">
          <SelectSingleLogicApi
            name="schema_id"
            api={useFormApi}
            label="Schema"
            value={schema}
            step={step}
            toMetaQueryConfig={toMetaQueryConfig}
          />
          <Input
            name="content.target_table"
            label="Table Name"
            api={useFormApi}
            placeholder="Define table name or use a variable"
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
        type={TargetTypes.AZURE_SQL}
      />
    </form>
  );
}

export const mergeMethods = [
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
  'NVARCHAR',
  'FLOAT',
  'TIMESTAMP',
  'INTEGER',
  'BIGINT',
  'DATETIME',
];

export const defaultType = types[0];
const LENGTH = 256;
export const defaultLengthByType = {
  TEXT: LENGTH,
  CHAR: LENGTH,
  NCHAR: LENGTH,
  VARCHAR: LENGTH,
  NVARCHAR: LENGTH,
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
    ExpressionColumn,
    AddChildColumn,
    RowActionsColumns,
  ],
};

export const toMetaQueryConfig = (step: any) => {
  return {
    id: getOId(step.content?.gConnection),
    step,
    type: MetadataType.SCHEMAS,
    callType: CallType.LOGIC,
  };
};

export const LogicTargets = {
  Table: true,
  Variable: true,
  FileExport: false,
};
