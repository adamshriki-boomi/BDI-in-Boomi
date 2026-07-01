import { RadioGroup, Tag, TagLabel } from '@chakra-ui/react';
import {
  Box,
  ConfirmationModal,
  Flex,
  Icon,
  Radio,
  RefreshIcon,
  RiveryButton,
  Text,
} from 'components';
import { useToastComponent } from 'hooks/useToast';
import { useReloadSingleTableMetadata } from '../../../hooks';

import { SourceTypes } from 'api/types';
import {
  useIsSupportedPredefinedReports,
  useSttFormContext,
} from 'modules/SourceTarget/components/form';
import { RunType } from 'modules/SourceTarget/components/form/form.consts';
import { useGetSchemaTableNameCaption } from 'modules/SourceTarget/hooks';
import { IModifiedColumn } from 'modules/SourceTarget/store';
import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTableSettingsFormContext } from '../form.hooks';
import { useColumns } from '../Mapping/hooks/useColumns';
import { useCombinedColumns } from '../Mapping/hooks/useCombinedColumns';
import { detectColumnConflicts } from '../Mapping/utils';

enum ConflictResolution {
  OVERRIDE = 'override',
  KEEP = 'keep',
}

export default function ReloadTableMetadata({
  isDisabled = false,
  buttonProps = {},
  successText = 'Metadata reloaded successfully.',
}) {
  const mainRiverForm = useSttFormContext();
  const targetType = mainRiverForm?.watch('river.properties.target.name');
  const formApi = useFormContext();
  const tableSettingsFormApi = useTableSettingsFormContext();
  const isBlueprint =
    mainRiverForm?.watch('river.properties.source.name') ===
    SourceTypes.BLUEPRINT;
  const isPredefined = useIsSupportedPredefinedReports();

  // Check if this is a custom query river - hide reload button for custom query
  const runType = mainRiverForm?.watch('river.properties.source.run_type');
  const isCustomQuery = runType === RunType.CUSTOM_QUERY;

  const { reloadColumns, loading } = useReloadSingleTableMetadata(
    isBlueprint,
    null,
    targetType,
  );
  const { success } = useToastComponent();

  // Get columns and modified columns for conflict detection
  const { columns } = useColumns();
  const modifiedColumns = tableSettingsFormApi.watch('table.modified_columns');
  const modifiedColumnsMap = (modifiedColumns as IModifiedColumn[])?.reduce(
    (map, value) => {
      map.set(value.name, value);
      return map;
    },
    new Map<string, IModifiedColumn>(),
  );
  const [allCurrentColumns] = useCombinedColumns(
    modifiedColumnsMap,
    null,
    null,
  );

  // Modal state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState<{
    calculatedColumns: IModifiedColumn[];
    conflictedColumns: IModifiedColumn[];
    nonConflictedColumns: IModifiedColumn[];
  } | null>(null);
  const [resolution, setResolution] = useState<ConflictResolution>(
    ConflictResolution.OVERRIDE,
  );

  const applyReloadResults = useCallback(
    (
      calculatedColumns: IModifiedColumn[],
      columnsToKeep: IModifiedColumn[],
    ) => {
      const finalModifiedColumns = [...calculatedColumns, ...columnsToKeep];
      formApi.setValue('table.modified_columns', finalModifiedColumns);
      success({
        description: successText,
        duration: 10000,
      });
    },
    [formApi, success, successText],
  );

  const handleReload = async () => {
    return reloadColumns().then(() => {
      // Detect conflicts between current columns and fresh metadata
      const { calculatedColumns, conflictedColumns, nonConflictedColumns } =
        detectColumnConflicts(allCurrentColumns, columns);

      // If conflicts exist, show modal
      if (conflictedColumns.length > 0) {
        setConflictData({
          calculatedColumns,
          conflictedColumns,
          nonConflictedColumns,
        });
        setShowConflictModal(true);
      } else {
        // No conflicts - only keep calculated columns
        applyReloadResults(calculatedColumns, []);
      }
    });
  };

  const handleConfirmConflictResolution = useCallback(() => {
    if (!conflictData) return;

    const { calculatedColumns, conflictedColumns } = conflictData;

    if (resolution === ConflictResolution.OVERRIDE) {
      // Override: Keep only calculated columns, fresh metadata applies for conflicted
      applyReloadResults(calculatedColumns, []);
    } else {
      // Keep changes: Preserve calculated + conflicted columns
      applyReloadResults(calculatedColumns, conflictedColumns);
    }

    setShowConflictModal(false);
    setConflictData(null);
  }, [conflictData, resolution, applyReloadResults]);

  const handleCancelConflictResolution = useCallback(() => {
    setShowConflictModal(false);
    setConflictData(null);
  }, []);

  // Hide for blueprints and custom query
  if (isBlueprint || isCustomQuery) {
    return null;
  }

  return (
    <>
      {isPredefined ? (
        <Box w="180px" />
      ) : (
        <RiveryButton
          label="Reload Metadata"
          variant="ghost"
          leftIcon={<Icon as={RefreshIcon} />}
          mr="auto"
          onClick={handleReload}
          isDisabled={isDisabled}
          isLoading={loading}
          {...buttonProps}
        />
      )}

      <ConfirmationModal
        variant="warning"
        title="Column Conflicts Detected"
        confirmLabel="Apply"
        show={showConflictModal}
        onConfirm={handleConfirmConflictResolution}
        onCancel={handleCancelConflictResolution}
        onClose={handleCancelConflictResolution}
      >
        <Flex flexDir="column" gap={4}>
          <Text>
            The following columns have been modified and differ from the new
            metadata.
            <br /> Please choose how to proceed:
          </Text>

          <Box borderRadius="md" maxH="150px" overflowY="auto">
            <Text textStyle="M7" mb={2}>
              Conflicted Columns:
            </Text>
            <Flex flexWrap="wrap" gap={2}>
              {conflictData?.conflictedColumns.map(column => (
                <Tag key={column.name} variant="yellow">
                  <TagLabel>{column.name}</TagLabel>
                </Tag>
              ))}
            </Flex>
          </Box>

          <RadioGroup
            value={resolution}
            onChange={value => setResolution(value as ConflictResolution)}
          >
            <Flex flexDir="column" gap={3}>
              <ConflictResolutionOption
                resolution={resolution}
                type={ConflictResolution.OVERRIDE}
                label="Override with new metadata"
                description="Replace conflicted columns with fresh metadata from the database."
              />
              <ConflictResolutionOption
                resolution={resolution}
                type={ConflictResolution.KEEP}
                label="Keep my changes"
                description="Preserve your modifications for conflicted columns."
              />
              <Text textStyle="R8" color="font-secondary">
                * Calculated columns will be preserved.
              </Text>
            </Flex>
          </RadioGroup>
        </Flex>
      </ConfirmationModal>
    </>
  );
}

function ConflictResolutionOption({
  resolution,
  type,
  label,
  description,
}: {
  resolution: ConflictResolution;
  type: ConflictResolution;
  label: string;
  description: string;
}) {
  const color = resolution === type ? 'font' : 'font-secondary';
  return (
    <Flex alignItems="start" gap={2}>
      <Radio name={type} value={type} mt={1} />
      <Flex flexDir="column">
        <Text textStyle="M7" color={color}>
          {label}
        </Text>
        <Text textStyle="R8" color={color}>
          {description}
        </Text>
      </Flex>
    </Flex>
  );
}

export function ReloadMetadataForNoSchemaStructure({ onReload, loading }) {
  const { tableNameCaption } = useGetSchemaTableNameCaption();
  return (
    <RiveryButton
      label={`Reload ${tableNameCaption} Metadata`}
      variant="ghost"
      leftIcon={<Icon as={RefreshIcon} />}
      mr="auto"
      onClick={onReload}
      isLoading={loading}
    />
  );
}
