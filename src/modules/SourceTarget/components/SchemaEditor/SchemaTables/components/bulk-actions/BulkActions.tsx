import {
  DrawerBody,
  DrawerCloseButton,
  DrawerHeader,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import {
  ButtonCreate,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  HStack,
  Icon,
  RdsBulk,
  RiveryButton,
  Text,
} from 'components';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';

import * as React from 'react';
import { useCallback, useState } from 'react';
import SvgRdsBulk from 'components/Icons/components/RdsBulk';
import { Wizard } from 'components/StepsWizard/Wizard';
import { BulkSelectTablesStep } from './bulk-actions-steps/BulkSelectTablesStep';
import { FormProvider } from 'react-hook-form';
import {
  BulkActionsTabs,
  BulkCDCExtractionModeValues,
  BulkExtractMethodStandardValues,
  BulkStandardLoadingMergeMethodValues,
  BulkStandardLoadingModeValues,
  BulkTableSelectionTypeValues,
} from './consts';
import { BulkSelectActionsStep } from './bulk-actions-steps/BulkSelectActionsStep';
import { BulkSummaryConfirmation } from './bulk-actions-steps/BulkSummaryConfirmation';
import { useBulkStepsValidation } from './bulk-actions-steps/useBulkStepsValidation';
import {
  useBulkActionsSchema,
  useInitialBulkForm,
} from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/components/bulk-actions/hooks';
import {
  IRiverExtractMethod,
  ISelectedTable,
  Schemas,
} from 'modules/SourceTarget/store';
import { useGetRiverCommonProps } from 'modules/SourceTarget';
import { useMainRiverFormContext } from 'hooks/useMainRiverFormContext';
import { ExtractMethod } from 'api/types';

export function BulkActions({ disabled }) {
  const { isOpen, onToggle } = useDisclosure();
  return (
    <>
      <ButtonCreate
        gridArea="extract"
        aria-label="Bulk Actions"
        variant="default"
        leftIcon={<Icon as={SvgRdsBulk} boxSize={4} />}
        onClick={onToggle}
        isDisabled={disabled}
        tooltip={'Select at least 2 tables\nto perform bulk actions'}
        size="base"
      >
        Bulk Actions
      </ButtonCreate>
      <Drawer size="medium" isOpen={isOpen} onClose={onToggle}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton
            position="absolute"
            top={4}
            right={4}
            onClick={onToggle}
          />
          <DrawerHeader pt={4} pb={0}>
            <HStack
              borderBottom="1px"
              borderBottomColor="gray.300"
              alignItems="center"
              pb={2}
            >
              <Icon as={RdsBulk} color="background-selected" />
              <Text textStyle="M4">Bulk Actions</Text>
            </HStack>
          </DrawerHeader>
          <BulkActionDrawerBody onToggle={onToggle} />
        </DrawerContent>
      </Drawer>
    </>
  );
}

function BulkActionDrawerBody({ onToggle }) {
  const [currentStep, setStep] = useState(0);
  const mainRiverForm = useMainRiverFormContext();
  const formApi = useInitialBulkForm();
  const { trigger } = useBulkActionsSchema(formApi);
  const { selectedRiverExtractMethod } = useGetRiverCommonProps();

  const resetIncrementalFieldsIfNeeded = useCallback(
    (step, formApi) => {
      if (step === 1) {
        formApi.unregister('table');
        trigger();
      }
    },
    [trigger],
  );

  const onStepChange = useCallback(
    (step, formApi = undefined) => {
      setStep(step);
      resetIncrementalFieldsIfNeeded(step, formApi);
    },
    [resetIncrementalFieldsIfNeeded],
  );

  const isValidStep = useBulkStepsValidation(currentStep, formApi);

  const getSelectedSchemas = useCallback(
    (schemas: Schemas) => {
      const selectionType = formApi.watch('selectionType');
      switch (selectionType) {
        case BulkTableSelectionTypeValues.SCHEMAS:
          return formApi.watch('selectedSchemas');
        case BulkTableSelectionTypeValues.SPECIFIC:
          return Object.entries(formApi.watch('specificTables'))
            .filter(([tables]) => Object.values(tables).some(Boolean))
            .map(([schemaKey]) => schemaKey);
        case BulkTableSelectionTypeValues.CONDITIONS:
          return Object.entries(formApi.watch('filteredTables'))
            .filter(([tables]) => Object.values(tables).some(Boolean))
            .map(([schemaKey]) => schemaKey);
        case BulkTableSelectionTypeValues.ALL:
          return Object.keys(schemas);
      }
    },
    [formApi],
  );

  const updateTargetSettings = useCallback(
    (table: ISelectedTable) => {
      const loadingMode = formApi.watch('actions.loadingMode');
      if (loadingMode === BulkStandardLoadingModeValues.DEFAULT) {
        const loadingMethod = formApi.watch('actions.loadingMethod');
        const isLoadingMethodMerge =
          loadingMethod === BulkStandardLoadingMergeMethodValues.MERGE;
        if (!table.additional_target_settings) {
          table.additional_target_settings = {};
        }
        table.additional_target_settings.target_loading = loadingMethod;
        if (isLoadingMethodMerge) {
          table.additional_target_settings.merge_method = formApi.watch(
            'actions.mergeMethod',
          );
        }
      }
    },
    [formApi],
  );

  const updateCDCSettings = useCallback(
    table => {
      const initialMigration = formApi.watch('actions.initialMigration');
      if (formApi.watch('isCDC') && initialMigration) {
        if (!table.cdc_settings) {
          table.cdc_settings = {};
        }
        table.cdc_settings.initiate_table = true;
        const migrationMode = formApi.watch('actions.migrationMode');
        table.cdc_settings.overwrite_table_in_migration =
          migrationMode === BulkCDCExtractionModeValues.OVERWRITE;
      }
    },
    [formApi],
  );

  const updateCalculatedColumns = useCallback(
    (table: ISelectedTable) => {
      const newCalculatedColumns = formApi.watch(
        'actions.newCalculatedColumns',
      );

      const transformedColumns = newCalculatedColumns.map(
        (column: any, index: number) => ({
          is_selected: column.is_selected,
          name: column.name,
          calculated_column_mode: column.calculated_column_mode,
          expression: column.expression,
          type: column.type,
          alias: column.alias || column.name,
          order: index,
          is_key: column.is_key || false,
        }),
      );

      if (table.modified_columns?.length > 0) {
        table.modified_columns = [
          ...table.modified_columns,
          ...transformedColumns,
        ];
      } else {
        table.modified_columns = transformedColumns;
      }
    },
    [formApi],
  );

  const updateSchema = useCallback(
    (table: ISelectedTable) => {
      const extractMethod = formApi.watch('actions.extractMethod');
      if (!formApi.watch('isCDC')) {
        switch (extractMethod) {
          case BulkExtractMethodStandardValues.TIME:
            if (
              table.extract_method === ExtractMethod.INCREMENTAL ||
              IRiverExtractMethod.SYSTEM_VERSIONING ===
                selectedRiverExtractMethod
            ) {
              // todo: add type in ['date', 'datetime']
              table.date_range = formApi.watch('actions.timePeriod');
            }
            break;
          case BulkExtractMethodStandardValues.ALL:
            table.extract_method = 'all';
            table.incremental_field = null;
            table.incremental_type = undefined;
            delete table.running_number;
            delete table.date_range;
            delete table.epoch;
            break;
          case BulkExtractMethodStandardValues.INCREMENTAL:
            table.extract_method = ExtractMethod.INCREMENTAL;

            const incField = formApi.watch('table.incremental_field');
            table.incremental_field = incField;

            // ensure the custom value is available in the row dropdown options
            if (incField) {
              table.custom_increment_columns = Array.from(
                new Set([...(table.custom_increment_columns ?? []), incField]),
              );
            }

            const runningNumber = formApi.watch('table.running_number');
            const date_range = formApi.watch('table.date_range');
            const epoch = formApi.watch('table.epoch');

            delete table.running_number;
            delete table.date_range;
            delete table.epoch;

            (table as any).incremental_type = formApi.watch(
              'table.incremental_type',
            );
            if (runningNumber) {
              table.running_number = runningNumber;
            } else if (date_range) {
              table.date_range = date_range;
            } else if (epoch) {
              table.epoch = epoch;
            }
            break;
        }
      }
    },
    [formApi, selectedRiverExtractMethod],
  );

  function getSelectedTablesToUpdate(formApi) {
    const selectionType = formApi.watch('selectionType');
    const specificTables = formApi.watch('specificTables');
    const filteredTables = formApi.watch('filteredTables');

    switch (selectionType) {
      case BulkTableSelectionTypeValues.SPECIFIC:
        return (_, schemaKey) => specificTables[schemaKey] || {};
      case BulkTableSelectionTypeValues.CONDITIONS:
        return (_, schemaKey) => filteredTables[schemaKey] || {};
      case BulkTableSelectionTypeValues.SCHEMAS:
      case BulkTableSelectionTypeValues.ALL:
        return schema =>
          Object.keys(schema).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {},
          );
      default:
        return () => ({});
    }
  }

  const onApplyChanges = useCallback(() => {
    const river = mainRiverForm.watch('river');
    const schemas = { ...river.properties.schemas };
    const filteredSchemas = getSelectedSchemas(schemas);
    const getSelectedTables = getSelectedTablesToUpdate(formApi);

    Object.keys(schemas).forEach(schemaKey => {
      if (!filteredSchemas.includes(schemaKey)) return;
      const schema = schemas[schemaKey];
      const selectedTablesForSchema = getSelectedTables(schema, schemaKey);

      Object.keys(schema).forEach(tableKey => {
        const table = schema[tableKey];

        if (
          typeof table !== 'boolean' &&
          table.is_selected === true &&
          selectedTablesForSchema[tableKey]
        ) {
          updateTargetSettings(table);
          updateCDCSettings(table);
          updateCalculatedColumns(table);
          updateSchema(table);
        }
      });
    });
    mainRiverForm.setValue(
      'river',
      {
        ...river,
        properties: {
          ...river.properties,
          schemas,
        },
      },
      { shouldDirty: true },
    );

    onToggle();
  }, [
    mainRiverForm,
    getSelectedSchemas,
    formApi,
    onToggle,
    updateTargetSettings,
    updateCDCSettings,
    updateCalculatedColumns,
    updateSchema,
  ]);

  const steps = [
    [BulkActionsTabs.SELECT_TABLES, BulkSelectTablesStep],
    [BulkActionsTabs.BULK_ACTIONS, BulkSelectActionsStep],
    [BulkActionsTabs.SUMMARY_CONFIRMATION, BulkSummaryConfirmation],
  ];

  const navigationButtons = () => {
    if (currentStep === 0) {
      return (
        <RiveryButton
          label="Next"
          isDisabled={!isValidStep?.[currentStep + 1]}
          onClick={() => onStepChange(1, formApi)}
        />
      );
    } else if (currentStep === 1) {
      return (
        <Flex gap={2}>
          <RiveryButton
            label="Back"
            variant="outline"
            onClick={() => onStepChange(0)}
          />
          <RiveryButton
            label="Next"
            isDisabled={!isValidStep?.[currentStep + 1]}
            onClick={() => onStepChange(2)}
          />
        </Flex>
      );
    } else {
      return (
        <Flex gap={2}>
          <RiveryButton
            label="Back"
            variant="outline"
            onClick={() => onStepChange(1)}
          />
          <RiveryButton label="Apply Bulk Actions" onClick={onApplyChanges} />
        </Flex>
      );
    }
  };

  return (
    <>
      <DrawerBody>
        <FormProvider {...formApi}>
          <Wizard
            lineLength={70}
            steps={steps}
            onChange={index => {
              const isValid = isValidStep?.[index];
              if (isValid) {
                onStepChange(index, formApi);
              }
            }}
            active={currentStep}
            isValidStep={isValidStep}
          />
        </FormProvider>
      </DrawerBody>
      <RiveryDrawerFooter
        handleOnClose={onToggle}
        handleOnSuccess={onApplyChanges}
        saveLabel={navigationButtons()}
        cancelLabel={
          <RiveryButton
            label="Cancel"
            onClick={e => {
              e.preventDefault();
              onToggle();
            }}
            variant="default"
            size="base"
          />
        }
      />
    </>
  );
}
