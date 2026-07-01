import {
  FileCompressions,
  FileTypes,
  PartitionGranularity,
  PartitionType,
  TargetTypes,
} from 'api/types';
import {
  Box,
  ConfirmationModal,
  ExternalLink,
  Flex,
  HStack,
  Text,
} from 'components';
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
import { useToggle } from 'react-use';
import { getOId } from 'utils/api.sanitizer';
import { FZConnection } from '../RiverLogic/Logic/components/FilesExport';
import { LoadingMode } from '../RiverLogic/Logic/components/LoadingMode';
import { DropTableRiverEnds } from './components/';
import { DataBaseSelect } from './components/MetaQuery/DataBaseSelect';
import { SchemaSelect } from './components/MetaQuery/SchemaSelect';
import { ModalColumnsMapperController } from './components/ModalColumnsMapperController';

export function LogicTable({ useFormApi, onSubmitHandler, step }) {
  const formChanges = useFormApi.watch();
  const control = useFormApi.control;
  const { content } = formChanges;
  const showPartitionGranularity = Boolean(content.partition_type);

  const {
    content: { database, schema_id: schema },
  } = step;
  const selectedDatabase = database ? createOption(database) : '';
  const selectedSchema = schema ? { value: schema, label: schema } : '';
  const MaskingPolicyToggle = useMaskingPolicyToggle({
    api: useFormApi,
    step,
  });

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

  function updatePartitionType(fields, useFormApi) {
    const hasPartition = fields.find(({ partition }) => partition);
    if (hasPartition !== Boolean(content.partition_type)) {
      const partitionValue = !hasPartition
        ? partitionTypeOptions[0].value
        : partitionTypeOptions[1].value;
      useFormApi.setValue('content.partition_type', partitionValue, {
        shouldDirty: true,
      });
      onPartitionTypeSelect(partitionValue);
    }
  }

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FormSection title="Load Into">
          <DataBaseSelect
            connectionId={getOId(step.content?.gConnection)}
            value={selectedDatabase}
            useFormApi={useFormApi}
            step={step}
            name="content.database"
            chakra={false}
          />
          <SchemaSelect
            value={selectedSchema}
            useFormApi={useFormApi}
            step={step}
            errorPrompt={database}
            name="content.schema_id"
            chakra={false}
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
            logicalKeyRequired={true}
          />
          <MaskingPolicyToggle />
          <DropTableRiverEnds api={useFormApi} />
        </FormSection>
        <FormSection title="Advanced Options">
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
                options={
                  typeOptionsPartitionGranularity?.[content.partition_type]
                    ?.list
                }
                controlId="partition granularity"
                api={useFormApi}
              />
            </Box>
          ) : null}
        </FormSection>
      </Flex>
      <ModalColumnsMapperController
        control={control}
        api={useFormApi}
        onChange={updatePartitionType}
        step={step}
        type={TargetTypes.ONELAKE}
      />
    </form>
  );
}

export function LogicFilesExport({ onSubmitHandler, useFormApi, content }) {
  const formChanges = useFormApi.watch();

  const showCsvInputs = formChanges.content.file_type === FileTypes.CSV;
  const showCompression = formChanges.content.file_type !== FileTypes.AVRO;

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

export function LogicDataframe({ useFormApi, onSubmitHandler, step }) {
  const {
    content: { database, schema_id: schema },
  } = step;
  const selectedDatabase = database ? createOption(database) : '';
  const selectedSchema = schema ? { value: schema, label: schema } : '';
  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3} ml={3}>
        <Text fontSize="small">
          By default, the DataFrame location will be set to a PUBLIC Schema and
          deleted once the process is completed.
        </Text>
        <Text fontSize="small">
          (Optional) select the preferred Database a Scheme location
        </Text>
        <FormSection title="">
          <DataBaseSelect
            connectionId={getOId(step.content?.gConnection)}
            value={selectedDatabase}
            useFormApi={useFormApi}
            step={step}
            name="content.database"
            chakra={false}
          />
          <SchemaSelect
            value={selectedSchema}
            useFormApi={useFormApi}
            step={step}
            errorPrompt={database}
            name="content.schema_id"
            chakra={false}
          />
        </FormSection>
      </Flex>
    </form>
  );
}

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
];

export const types = [
  'STRING',
  'INTEGER',
  'FLOAT',
  'BOOLEAN',
  'TIMESTAMP',
  'TIME',
  'VARIANT',
  'NUMERIC',
  'RECORD',
];

export const defaultType = types[0];

export const mappingCols = {
  columns: [
    HeaderColumn,
    KeyColumn,
    TargetColumn,
    toTypeSelector({
      typeOptions: types,
      repeat: true,
    }),
    ModeSelectorColumn,
    {
      Header: 'Cluster Key',
      Cell: MappingOrder,
      weight: 'max-content',
      accessor: 'id',
      styleProps: { justifyContent: 'center' },
    },
    {
      Header: 'Partition',
      Cell: UniqueField,
      UniqueFieldKey: 'partition',
      includeConfirmationModal: true,
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

const partitionTypeOptions = [
  {
    label: 'No Partition',
    value: '',
  },
  {
    label: 'TIMESTAMP',
    value: PartitionType.TIMESTAMP,
  },
];

export const typeOptionsPartitionGranularity = {
  TIMESTAMP: {
    partition_type: PartitionType.TIMESTAMP,
    default: PartitionGranularity.DAY,
    list: [
      { label: PartitionGranularity.YEAR, value: PartitionGranularity.YEAR },
      { label: PartitionGranularity.MONTH, value: PartitionGranularity.MONTH },
      { label: PartitionGranularity.DAY, value: PartitionGranularity.DAY },
      { label: PartitionGranularity.HOUR, value: PartitionGranularity.HOUR },
    ],
  },
  DATETIME: {
    partition_type: PartitionType.DATETIME,
    default: PartitionGranularity.DAY,
    list: [
      { label: PartitionGranularity.YEAR, value: PartitionGranularity.YEAR },
      { label: PartitionGranularity.MONTH, value: PartitionGranularity.MONTH },
      { label: PartitionGranularity.DAY, value: PartitionGranularity.DAY },
      { label: PartitionGranularity.HOUR, value: PartitionGranularity.HOUR },
    ],
  },
  DATE: {
    partition_type: PartitionType.DATE,
    default: PartitionGranularity.DAY,
    list: [
      { label: PartitionGranularity.YEAR, value: PartitionGranularity.YEAR },
      { label: PartitionGranularity.MONTH, value: PartitionGranularity.MONTH },
      { label: PartitionGranularity.DAY, value: PartitionGranularity.DAY },
    ],
  },
};

//The key is the old api name, the value is new api name
export const targetConnectionFields = {
  database: 'database_name',
  schema_id: 'schema_name',
};
const useMaskingPolicyToggle = ({ api, step }) => {
  const {
    content: { enforce_masking_policy: enforceMaskingPolicy },
  } = step;
  const [showConfirmationMasking, toggleShowConfirmationMasking] =
    useToggle(false);

  return () => (
    <>
      <RiverySwitch
        name="content.enforce_masking_policy"
        label="Enforce Masking Policy"
        api={api}
        onChange={toggleShowConfirmationMasking}
        tooltip={
          <>
            This option will preserve the data masking policy that is applied on
            the column level in your target table.
            <ExternalLink
              alignItems="start"
              mt={1}
              display="block"
              url="https://help.boomi.com/docs/Atomsphere/Data_Integration/Targets/Snowflake/snowflake-as-a-target#enforce-masking-policy"
              label="Read More..."
            />
          </>
        }
      />

      <ConfirmationModal
        show={showConfirmationMasking}
        onClose={toggleShowConfirmationMasking}
        onConfirm={() =>
          api.setValue(
            'content.enforce_masking_policy',
            !enforceMaskingPolicy,
            {
              shouldDirty: true,
            },
          )
        }
        onCancel={() =>
          api.setValue('content.enforce_masking_policy', enforceMaskingPolicy, {
            shouldDirty: true,
          })
        }
        title="Warning"
        description={
          !enforceMaskingPolicy
            ? 'To enforce masking policy, please make sure you have the needed permission to copy the masking policy and there is at least one columns with active masking policy in the target table, otherwise the run will fail.'
            : 'Please be aware that if you disable the masking policy, your target table may contain data without any masking policies being applied.'
        }
        variant="warning"
        confirmLabel="Apply"
      />
    </>
  );
};
