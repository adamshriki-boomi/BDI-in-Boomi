import { Box, Flex } from '@chakra-ui/react';
import { MetadataType } from 'api/endpoints/metadata.api';
import { MergeMethods, TargetTypes } from 'api/types';
import {
  AddChildColumn,
  ExpressionColumn,
  HeaderColumn,
  KeyColumn,
  ModeSelectorColumn,
  RowActionsColumns,
  TargetColumn,
  toTypeSelector,
  UniqueField,
} from 'components/Form/columnsMapperConfig';
import {
  createOption,
  FormSelect,
  Input,
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
import { ModalColumnsMapperController } from './components/ModalColumnsMapperController';
export function LogicFilesExport({ useFormApi, content, onSubmitHandler }) {
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
      </Flex>
    </form>
  );
}

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
            name="content.schema_id"
            label="Schema"
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
          <LoadingMode
            formChanges={formChanges}
            useFormApi={useFormApi}
            mergeMethods={mergeMethods}
          />
          <Box mt={2}>
            <RiverySwitch
              name="content.analyze_tables"
              label="Analyze table after load"
              api={useFormApi}
            />
          </Box>
          <DropTableRiverEnds api={useFormApi} />
        </FormSection>
      </Flex>
      <ModalColumnsMapperController
        control={control}
        api={useFormApi}
        step={step}
        type={TargetTypes.POSTGRES}
      />
    </form>
  );
}

export const mergeMethods = [
  {
    label: 'Insert On Conflict',
    value: MergeMethods.INSERT_ON_CONFLICT,
  },
  {
    label: 'Delete - Insert',
    value: MergeMethods.DELETE_INSERT,
  },
];

export const types = [
  'VARCHAR',
  'INTEGER',
  'NUMERIC',
  'BIGINT',
  'SMALLINT',
  'DECIMAL',
  'REAL',
  'TEXT',
  'DOUBLE_PRECISION',
  'MONEY',
  'BOOLEAN',
  'CHAR',
  'DATE',
  'TIMESTAMP',
  'TIME',
  'XML',
  'JSON',
  'JSONB',
  'BIT',
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
      Header: 'Dist',
      accessor: 'dist',
      Cell: UniqueField,
    },
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
