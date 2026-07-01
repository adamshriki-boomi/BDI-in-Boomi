import { MetadataType } from 'api/endpoints/metadata.api';
import {
  FileCompressions,
  FileTypes,
  MergeMethods,
  PartitionGranularity,
  PartitionType,
  QueryPriority,
  SplitInterval,
  SplitTables,
  TargetTypes,
} from 'api/types';
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
  UniqueField,
} from 'components/Form/columnsMapperConfig';
import {
  createOption,
  FormSelect,
  Input,
  InputTypes,
  Radio,
  RiverySwitch,
} from 'components/Form/components';
import { FormSection } from 'components/Form/FormSection';
import { FZBucket } from 'hooks/useFZBuckets';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useGetMetadataQuery } from 'store/metadata';
import { CallType } from 'store/river/hooks/useRiverForMetadataCall';
import { getOId } from 'utils/api.sanitizer';
import { isVariableString } from '../hooks/useAsyncMetadata';
import { EditUDFSourceURI } from '../RiverLogic/Logic/components/AdvancedOptions/EditUDFSourceURI';
import { LoadingMode } from '../RiverLogic/Logic/components/LoadingMode';
import { DropTableRiverEnds } from './components/';
import { ModalColumnsMapperController } from './components/ModalColumnsMapperController';
import {
  SQLDialects,
  SQLDialectsValues,
} from 'modules/SourceTarget/components/SelectDataTarget/DataTargetSettings/TargetBigQuery';

export function LogicTable({ onSubmitHandler, useFormApi, step }) {
  const formChanges = useFormApi.watch();
  const control = useFormApi.control;
  const { content } = formChanges;
  const showTimestampPicker = content.split_tables === SplitTables.RECORD;
  const isStandardSQL = Boolean(step.content.use_standard_sql);
  const showSplitData = content.split_tables === SplitTables.FORMULA;
  const showPartitionGranularity = Boolean(content.partition_type);

  const splitTablesOptions = [
    {
      label: "Don't Split",
      value: SplitTables.NO,
    },
    {
      label: 'By Insert Timestamp',
      value: SplitTables.RECORD,
    },
    {
      label: 'By Expression',
      value: SplitTables.FORMULA,
    },
  ];
  const splitIntervalValues = [
    {
      label: 'Hourly',
      value: SplitInterval.HOURLY,
    },
    {
      label: 'Daily',
      value: SplitInterval.DAILY,
    },
    {
      label: 'Monthly',
      value: SplitInterval.MONTHLY,
    },
    {
      label: 'Yearly',
      value: SplitInterval.YEARLY,
    },
  ];
  const mergeMethods = [
    {
      label: 'Merge',
      value: MergeMethods.MERGE,
    },
    {
      label: 'Switch - Merge',
      value: MergeMethods.SWITCH_TABLES,
    },
    {
      label: 'Delete - Insert',
      value: MergeMethods.DELETE_INSERT,
    },
  ];

  function updatePartitionType(fields, useFormApi) {
    const hasPartition = fields.find(({ partition }) => partition);
    if (hasPartition !== Boolean(content.partition_type)) {
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

  const datasetsResponse = useGetMetadataQuery(toMetaQueryConfig(step));

  const {
    content: { dataset_id },
  } = step;
  const selectedDataset = dataset_id ? createOption(dataset_id) : '';

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FormSection title="Load Into">
          <FormSelect
            label="Dataset ID"
            name="content.dataset_id"
            metadataResponse={datasetsResponse}
            options={datasetsResponse?.data}
            isValidNewOption={isVariableString}
            controlId="dataset_id"
            api={useFormApi}
            value={selectedDataset}
            editableCreate
            defaultCreateLabel=""
            placeholder="Select dataset or use a variable"
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
            logicalKeyRequired={true}
            mergeMethods={content.use_standard_sql && mergeMethods}
          />
        </FormSection>
        <FormSection title="Advanced Options">
          {isStandardSQL ? (
            <>
              <FormSelect
                label="Partition Type"
                name="content.partition_type"
                options={partitionTypeOptions}
                controlId="partition type"
                api={useFormApi}
                onChange={onPartitionTypeSelect}
                disabled={content.split_tables !== SplitTables.NO}
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
            </>
          ) : null}
          <FormSelect
            label="Split Tables"
            name="content.split_tables"
            options={splitTablesOptions}
            controlId="split tables"
            api={useFormApi}
            disabled={!!content.partition_type}
          />
          {showTimestampPicker && (
            <Box ml={8} mb={2}>
              <Radio
                label="Split By Interval"
                name="content.split_interval"
                values={splitIntervalValues}
                api={useFormApi}
              />
            </Box>
          )}
          {showSplitData && (
            <Box ml={6} mb={2}>
              <Input
                name="content.split_data"
                label="Fields Expression to split by"
                api={useFormApi}
                required
              />
            </Box>
          )}
          <DropTableRiverEnds api={useFormApi} />
        </FormSection>
      </Flex>
      <ModalColumnsMapperController
        api={useFormApi}
        control={control}
        onChange={updatePartitionType}
        step={step}
        type={TargetTypes.BIG_QUERY}
      />
    </form>
  );
}

export const toMetaQueryConfig = (step: any) => {
  return {
    id: getOId(step.content?.gConnection),
    step,
    type: MetadataType.DATASETS,
    callType: CallType.LOGIC,
  };
};

export function LogicFilesExport({
  onSubmitHandler,
  useFormApi: api,
  stepName,
}) {
  const { content } = api.watch();
  const showCsvInputs = content.file_type === FileTypes.CSV;
  const showCompression = content.file_type !== FileTypes.AVRO;

  const labelWithStep = (label: string) => `${label} ${stepName}`;

  const fileTypeOptions = [
    {
      label: 'CSV',
      value: FileTypes.CSV,
    },
    {
      label: 'JSON',
      value: FileTypes.JSON,
    },
    {
      label: 'AVRO',
      value: FileTypes.AVRO,
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
  const createLabels = (label, withAria = false) => {
    return {
      'aria-label': labelWithStep(label),
      ...(withAria ? { ariaLabel: labelWithStep(label) } : {}),
      label,
    };
  };

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <Input
          name="content.dataset_id"
          api={api}
          {...createLabels('Dataset Id')}
        />
        <FZBucket
          connId={getOId(content?.gConnection)}
          dsId="gcs"
          connectionType="gcloud"
          api={api}
        />
        <Input
          name="content.file_path_destination"
          api={api}
          {...createLabels('File Name and File Path Destination')}
        />
        <Box my={3}>
          <RiverySwitch
            name="content.load_into_one_file"
            api={api}
            {...createLabels('Load into a single file', true)}
          />
        </Box>
        <Box mb={2}>
          <Radio
            name="content.file_type"
            values={fileTypeOptions}
            api={api}
            {...createLabels('File Type', true)}
          />
        </Box>

        {showCsvInputs && (
          <HStack gap={4}>
            <Input
              name="content.csv_details.delimiter"
              api={api}
              defaultValue=","
              {...createLabels('Field Delimiter')}
            />
            <Input
              name="content.csv_details.quote"
              api={api}
              defaultValue='"'
              {...createLabels('Quote Char')}
            />
            <RiverySwitch
              name="content.csv_details.include_header"
              api={api}
              {...createLabels('Include Header', true)}
            />
          </HStack>
        )}

        {showCompression && (
          <Box ml={2} mb={2}>
            <Radio
              name="content.compression"
              values={compressionOptions}
              api={api}
              {...createLabels('Compression', true)}
            />
          </Box>
        )}
      </Flex>
    </form>
  );
}

export function LogicAdvancedOptions({ content, useFormApi, stepName }) {
  const isStandardSQL = Boolean(content.use_standard_sql);
  const queryPriorities = [
    {
      label: 'Interactive',
      value: QueryPriority.INTERACTIVE,
    },
    {
      label: 'Batch',
      value: QueryPriority.BATCH,
    },
  ];
  return (
    <Flex flexDir="column" gap={3}>
      <Radio
        label="Interactive Query Priority"
        name="content.query_priority"
        values={queryPriorities}
        api={useFormApi}
      />
      <Box mt={4}>
        <SQLDialects
          hideAlert={true}
          onChange={val => {
            useFormApi.setValue(
              'content.use_standard_sql',
              val === SQLDialectsValues.STANDARD,
              {
                shouldDirty: true,
              },
            );
          }}
          value={
            isStandardSQL
              ? SQLDialectsValues.STANDARD
              : SQLDialectsValues.LEGACY
          }
        />
      </Box>
      {isStandardSQL ? (
        <>
          <Input
            name="content.billing_tier"
            label="Maximum Billing Tier"
            type={InputTypes.NUMBER}
            api={useFormApi}
            tooltip="The billing tier controls the amount of compute resources allotted to the query"
          />
          <RiverySwitch
            name="content.flatten_results_standard"
            label="Flatten Results"
            api={useFormApi}
          />
        </>
      ) : (
        <>
          <Controller
            name="content.udf_source"
            control={useFormApi.control}
            render={({ field: { onChange, value } }) => (
              <EditUDFSourceURI
                onChange={onChange}
                values={value}
                name="udf_source"
                label={stepName}
              />
            )}
          />
        </>
      )}
    </Flex>
  );
}

export const targetConnectionFields = {
  dataset_id: 'dataset_id',
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

export const types = [
  'STRING',
  'BIGINT',
  'FLOAT',
  'BOOLEAN',
  'TIMESTAMP',
  'TIME',
  'INTEGER',
  'SMALLINT',
  'TINYINT',
  'DOUBLE',
  'DATE',
  'BINARY',
  'NUMERIC',
  'JSON',
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
      Header: 'Cluster',
      Cell: MappingOrder,
      weight: '70px',
      limit: 4,
      styleProps: { justifyContent: 'center' },
      Condition: whereClause => {
        return Boolean(whereClause?.content?.use_standard_sql);
      },
      accessor: 'id',
    },
    {
      Header: 'Partition',
      Cell: UniqueField,
      UniqueFieldKey: 'partition',
      Condition: whereClause => {
        return Boolean(whereClause?.content?.use_standard_sql);
      },
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

export const defaultFields = {
  use_standard_sql: true,
  partition_type: '',
  query_priority: QueryPriority.INTERACTIVE,
};
