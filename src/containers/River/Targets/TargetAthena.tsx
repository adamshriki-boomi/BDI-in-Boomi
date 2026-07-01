import { Flex } from '@chakra-ui/react';
import { MetadataType } from 'api/endpoints/metadata.api';
import { PartitionType, TargetTypes } from 'api/types';
import { Box } from 'components';
import {
  AddChildColumn,
  CheckboxField,
  ExpressionColumn,
  HeaderColumn,
  KeyColumn,
  ModeSelectorColumn,
  RowActionsColumns,
  TargetColumn,
  toTypeSelector,
} from 'components/Form/columnsMapperConfig';
import {
  createOption,
  FormSelect,
  Input,
  InputTypes,
} from 'components/Form/components';
import { FormSection } from 'components/Form/FormSection';
import { FZBucket } from 'hooks/useFZBuckets';
import React, { useState } from 'react';
import { useGetMetadataQuery } from 'store/metadata';
import { CallType } from 'store/river/hooks/useRiverForMetadataCall';
import { getOId } from 'utils/api.sanitizer';
import { isVariableString } from '../hooks/useAsyncMetadata';
import { LoadingMode } from '../RiverLogic/Logic/components/LoadingMode';
import { DropTableRiverEnds } from './components/';
import { ModalColumnsMapperController } from './components/ModalColumnsMapperController';
import { typeOptionsPartitionGranularity } from './TargetBigQuery';

export function LogicTable({ useFormApi, onSubmitHandler, step }) {
  const formChanges = useFormApi.watch();
  const control = useFormApi.control;
  const schemasResponse = useGetMetadataQuery(toMetaQueryConfig(step));
  const {
    content: { schema_id: schema, partition_type: partitionType, fields },
  } = step;
  const selectedSchema = schema ? createOption(schema) : '';
  const showPartitionGranularity = Boolean(partitionType);
  const [showNumberOfBuckets, setShowNumberOfBucket] = useState(
    Boolean(fields?.find(({ bucket }) => bucket)),
  );

  function mappingCallback(fields, useFormApi) {
    const hasPartition = fields.find(({ partition }) => partition);
    const hasBuckets = Boolean(fields?.find(({ bucket }) => bucket));
    setShowNumberOfBucket(hasBuckets);
    if (typeof step?.content?.buckets_number === 'undefined') {
      useFormApi.setValue('content.buckets_number', 2, {
        shouldDirty: true,
      });
    }
    fields.find(({ partition }) => partition);
    if (hasPartition !== Boolean(partitionType)) {
      // If both exists or both does not exists we need to make a change
      const partitionValue = !hasPartition
        ? partitionTypeOptions[0].value
        : partitionTypeOptions[1].value;
      useFormApi.setValue('content.partition_type', partitionValue, {
        shouldDirty: true,
      });
      onPartitionTypeSelect(partitionValue);
    }
  }
  const onPartitionTypeSelect = value => {
    const granularity = typeOptionsPartitionGranularity[value];
    if (granularity) {
      useFormApi.setValue(
        'content.partition_granularity',
        granularity.default,
        { shouldDirty: true },
      );
    }
  };

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FormSection title="Load Into">
          <FZBucket
            connId={getOId(step.content?.gConnection)}
            dsId="s3"
            connectionType="aws"
            api={useFormApi}
          />
          <Input
            name="content.file_path_destination"
            label="File Name and File Path Destination"
            api={useFormApi}
          />
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
          <LoadingMode formChanges={formChanges} useFormApi={useFormApi} />

          <FormSelect
            label="Partition Type"
            name="content.partition_type"
            options={partitionTypeOptions}
            controlId="partition type"
            api={useFormApi}
            onChange={onPartitionTypeSelect}
            defaultValue={partitionTypeOptions[0]}
          />
          {showPartitionGranularity ? (
            <Box pl="4">
              <FormSelect
                label="Partition Granularity"
                name="content.partition_granularity"
                options={typeOptionsPartitionGranularity?.[partitionType]?.list}
                controlId="partition granularity"
                api={useFormApi}
              />
            </Box>
          ) : null}
          {showNumberOfBuckets ? (
            <Input
              type={InputTypes.NUMBER}
              label="Number Of Buckets"
              name="content.buckets_number"
              controlId="Number Of Buckets"
              api={useFormApi}
              helpText="Divides the data in the specified columns into buckets."
            />
          ) : null}
          <DropTableRiverEnds api={useFormApi} />
        </FormSection>
      </Flex>
      <ModalColumnsMapperController
        control={control}
        api={useFormApi}
        step={step}
        onChange={mappingCallback}
        type={TargetTypes.ATHENA}
      />
    </form>
  );
}

const partitionTypeOptions = [
  {
    label: 'No Partition',
    value: '',
  },
  {
    label: 'TIMESTAMP',
    value: PartitionType.TIMESTAMP,
  },
  {
    label: 'DATE',
    value: PartitionType.DATE,
  },
];

export const toMetaQueryConfig = (step: any) => {
  return {
    id: getOId(step.content?.gConnection),
    step,
    type: MetadataType.SCHEMAS,
    callType: CallType.LOGIC,
  };
};

export const types = [
  'STRING',
  'VARCHAR',
  'TINYINT',
  'SMALLINT',
  'BIGINT',
  'INTEGER',
  'BOOLEAN',
  'DOUBLE',
  'FLOAT',
  'DECIMAL',
  'DATE',
  'TIMESTAMP',
  'CHAR',
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
      Header: 'Bucket',
      fieldKey: 'bucket',
      Cell: CheckboxField,
      weight: '70px',
      limit: 4,
      styleProps: { justifyContent: 'center' },
      accessor: 'id',
    },
    {
      Header: 'Partition',
      Cell: CheckboxField,
      limit: 100,
      fieldKey: 'partition',
      isHidden: ({ getSortIndex }, { original }) => {
        return !typeOptionsPartitionGranularity.hasOwnProperty(original.type);
      },
      weight: '80px',
      accessor: 'partition',
      styleProps: { justifyContent: 'center' },
    },
    ExpressionColumn,
    AddChildColumn,
    RowActionsColumns,
  ],
};

export const LogicTargets = {
  Table: true,
  Variable: false,
  FileExport: false,
};

export const defaultFields = {
  buckets_number: 2,
};
