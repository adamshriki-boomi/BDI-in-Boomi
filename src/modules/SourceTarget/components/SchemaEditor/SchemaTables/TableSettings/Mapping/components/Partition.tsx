import { RenderGuard } from 'components';
import { CustomSelectForm, RiveryCheckbox } from 'components/Form';
import { useTableSettings } from '../../form.hooks';
import { PartitionType } from 'api/types';
import { typeOptionsPartitionGranularity } from 'containers/River/Targets/TargetBigQuery';
import { Tooltip } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';
import { ConfirmationPartitionModal } from 'components/Form/columnsMapperConfig';
import {
  useMainFormColumnsDefinitions,
  useSttFormContext,
} from 'modules/SourceTarget/components/form';
import { useController, useWatch } from 'react-hook-form';
import { useGetTarget } from 'modules/Datasources/useLogicTargets';

export function Partition({
  row: { original },
  column: {
    getProps: { modifiedColumnsMap, updateColumn },
  },
}) {
  const columns = Array.from(modifiedColumnsMap.values());
  const partitionKeySelected = columns.filter(
    (column: any) => column?.is_partition && column?.is_selected !== false,
  );
  const isCurrentColumPartition = Boolean(
    partitionKeySelected?.find(({ name }) => {
      return name === original.name;
    }),
  );
  const { value: splitTables } = useTableSettings(
    'additional_target_settings.split_tables',
  );
  const noSplitTableIsSelected = !splitTables || splitTables === 'no_split';
  const [showConfirmationModal, toggleConfirmationModal] = useToggle(false);
  const updatePartition = useUpdatePartition(toggleConfirmationModal);

  const targetName = useWatch({
    name: 'river.properties.target.name',
    control: useSttFormContext().control,
  });
  const targetSettings = useGetTarget(targetName)?.target_settings;
  const validPartitionTypes = ['TIMESTAMP', 'DATE', 'DATETIME'];
  if (targetSettings?.allow_partition_integer)
    validPartitionTypes.push('INTEGER');
  if (targetSettings?.allow_partition_string)
    validPartitionTypes.push('STRING');

  const isValidColumnType = validPartitionTypes.includes(original.type);
  const isAnotherPartitionSelected =
    partitionKeySelected.length > 0 && !isCurrentColumPartition;

  const isDisabled =
    !noSplitTableIsSelected ||
    !isValidColumnType ||
    isAnotherPartitionSelected ||
    original?.is_selected === false;
  const selectedCol = partitionKeySelected[0] as any;
  const disabledTooltip = useMemo(() => {
    if (!noSplitTableIsSelected) {
      return 'Partitioning is not available when split tables is enabled';
    }
    if (isAnotherPartitionSelected) {
      return `Column "${selectedCol?.name}" is already selected as the partition key`;
    }
    if (!isValidColumnType) {
      return `Only ${validPartitionTypes.join(
        ', ',
      )} columns can be used as partition keys`;
    }
    return '';
  }, [
    noSplitTableIsSelected,
    selectedCol,
    isValidColumnType,
    isAnotherPartitionSelected,
    validPartitionTypes,
  ]);

  const onConfirm = () => {
    updateColumn(original.name, {
      ...original,
      is_partition: true,
    });
    updatePartition(true);
    toggleConfirmationModal(false);
  };
  return (
    <>
      <ConfirmationPartitionModal
        show={showConfirmationModal}
        onCancel={() => toggleConfirmationModal(false)}
        onConfirm={onConfirm}
      />
      <Tooltip
        label={disabledTooltip}
        isDisabled={!isDisabled}
        hasArrow
        placement="top"
      >
        <span>
          <RiveryCheckbox
            name={`${original.name}-is_partition`}
            label={null}
            isDisabled={isDisabled}
            isChecked={isCurrentColumPartition}
            onChange={({ target }) => {
              if (target.checked) {
                toggleConfirmationModal(true);
              } else {
                updateColumn(original.name, {
                  ...original,
                  is_partition: target.checked,
                });
                updatePartition(Boolean(target.checked));
              }
            }}
          />
        </span>
      </Tooltip>
    </>
  );
}

export function PartitionGranularitySelect({
  row: { original },
  column: {
    getProps: { modifiedColumnsMap },
  },
}) {
  const mainFormApi = useSttFormContext();
  const { isCustomQuery } = useMainFormColumnsDefinitions();
  const columns = Array.from(modifiedColumnsMap.values());

  const partitionKeySelected = columns.filter(
    (column: any) => column?.is_partition,
  );
  const isCurrentColumPartition = Boolean(
    partitionKeySelected?.find(({ name }) => {
      return name === original.name && original.is_selected !== false;
    }),
  );
  const { update: updatePartitionGranularity, value: partitionGranularity } =
    useTableSettings('additional_target_settings.partition_granularity');

  const { field: singleTablepatitionGranularity } = useController({
    name: 'river.properties.target.single_table_settings.partition_granularity',
    control: mainFormApi.control,
  });
  const partitionGranularityValue = isCustomQuery
    ? singleTablepatitionGranularity.value
    : partitionGranularity;

  return (
    <RenderGuard condition={isCurrentColumPartition}>
      <CustomSelectForm
        options={partitionOptions}
        onChange={target => {
          isCustomQuery
            ? singleTablepatitionGranularity.onChange((target as any)?.value)
            : updatePartitionGranularity((target as any)?.value);
        }}
        value={partitionOptions.find(
          option => option?.value === partitionGranularityValue,
        )}
        controlId="partition granularity"
        isMulti={false}
        width="120px"
      />
    </RenderGuard>
  );
}

export const useUpdatePartition = close => {
  const mainFormApi = useSttFormContext();
  const { isCustomQuery } = useMainFormColumnsDefinitions();

  const { field: singleTablepatitionType } = useController({
    name: 'river.properties.target.single_table_settings.partition_type',
    control: mainFormApi.control,
  });
  const { update: updatePartitionField } = useTableSettings(
    'additional_target_settings.partition_type',
  );
  const { update: updatePartitionGranularity, value: partitionGranularity } =
    useTableSettings('additional_target_settings.partition_granularity');
  const { field: singleTablepatitionGranularity } = useController({
    name: 'river.properties.target.single_table_settings.partition_granularity',
    control: mainFormApi.control,
  });
  return (checkboxVal: boolean) => {
    const partition = checkboxVal ? PartitionType.TIMESTAMP : null;
    isCustomQuery
      ? singleTablepatitionType.onChange(partition)
      : updatePartitionField(partition);
    if (partition) {
      if (!partitionGranularity) {
        const granularity = typeOptionsPartitionGranularity[partition];
        isCustomQuery
          ? singleTablepatitionGranularity.onChange(granularity.default)
          : updatePartitionGranularity(granularity.default);
      }
    }
    close(false);
  };
};

const partitionOptions = [
  { label: 'Hour', value: 'HOUR' },
  { label: 'Day', value: 'DAY' },
  { label: 'Month', value: 'MONTH' },
  { label: 'Year', value: 'YEAR' },
];
