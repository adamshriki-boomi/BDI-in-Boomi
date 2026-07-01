import {
  Box,
  chakra,
  DrawerBody,
  DrawerCloseButton,
  DrawerHeader,
  useDisclosure,
} from '@chakra-ui/react';
import {
  ConfirmationModal,
  DownArrowFile,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  HStack,
  Icon,
  RenderGuard,
  RiveryButton,
  Text,
  VStack,
} from 'components';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import { isValidForCDCRiver } from 'containers/River/Settings/components/ScheduleEditor';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import {
  convertRiverToPayload,
  IRiverExtractMethod,
  transformResponseToKeyValue,
  useSttController,
  useGetBulkTablesTrigger,
} from 'modules/SourceTarget';
import { useSttSource } from 'modules/SourceTarget/components/form/form.hooks';
import { ITable, Schemas } from 'modules/SourceTarget/store';
import {
  useIsDisabledRiverForm,
  useSttFormContext,
} from 'modules/SourceTarget/components/form';
import { ExtractModeSelector } from 'modules/SourceTarget/components/form/ExtractMethod/ExtractMethodSelector';
import { InitialMigrationContent } from 'modules/SourceTarget/components/form/ExtractMethod/InitialMigrationModal';
import {
  EXTRACT_METHOD,
  SyncOption,
  SYNC_OPTION,
  RunType,
  EXTRACT_API,
} from 'modules/SourceTarget/components/form/form.consts';
import { Overlay } from 'modules/SourceTarget/components/OverlayDiv';
import { useCallback, useState } from 'react';
import { useToggle } from 'react-use';

export function ExtractMethodDrawer() {
  const { isOpen, onToggle } = useDisclosure();
  const isRiverFormDisabled = useIsDisabledRiverForm();
  return (
    <>
      <RiveryButton
        gridArea="extract"
        variant="default"
        label="Extraction Mode"
        leftIcon={<Icon as={DownArrowFile} />}
        onClick={onToggle}
      />
      <Drawer size="default" isOpen={isOpen} onClose={onToggle}>
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
              <Icon as={DownArrowFile} color="background-selected" />
              <Text textStyle="M4">Extraction Mode</Text>
            </HStack>
          </DrawerHeader>
          <chakra.fieldset disabled={isRiverFormDisabled} display="contents">
            <ExtractModeDrawerBody onToggle={onToggle} />
          </chakra.fieldset>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function onShouldSetScheduling(formApi, extractMethod) {
  const schedule = formApi.watch('river.schedulers')?.[0];
  if (extractMethod === IRiverExtractMethod.LOG) {
    if (!schedule?.is_enabled) {
      formApi.setError('river.properties.summary', {
        type: 'custom',
        message: 'Scheduling is required for CDC data flow',
      });
    } else {
      const isValidExpression =
        schedule?.cron_expression &&
        isValidForCDCRiver(schedule.cron_expression);
      if (!isValidExpression) {
        formApi.setError('river.properties.summary', {
          type: 'custom',
          message:
            'CDC Data Flow must run daily. The selected expression is not allowed for CDC data flows',
        });
      }
    }
  } else {
    formApi.clearErrors('river.properties.summary');
  }
}

const isCdcEligible = (table: {
  object_type?: string | null;
  resolved_object_type?: string | null;
}) => {
  const { object_type, resolved_object_type } = table;
  if (!object_type) return true;
  if (object_type === 'TABLE') return true;
  return (
    object_type === 'SYNONYM' &&
    (resolved_object_type === 'TABLE' ||
      resolved_object_type === 'EDITIONING_VIEW' ||
      resolved_object_type === 'EDITIONING VIEW')
  );
};

// Fetches object_type for all selected tables and returns those not eligible for CDC, with their schema.
async function getNonCdcEligibleTables(
  connectionId: string,
  schemas: Record<string, any>,
  getBulkTables: (args: any) => Promise<any>,
): Promise<{ id: string; schemaName: string }[]> {
  const schemasWithSelected = Object.entries(schemas)
    .map(([schemaName, tables]) => ({
      schemaName,
      tableIds: Object.entries(tables as Record<string, any>)
        .filter(([, table]) => table?.is_selected)
        .map(([tableId]) => tableId),
    }))
    .filter(({ tableIds }) => tableIds.length > 0);

  if (!schemasWithSelected.length) return [];

  const results = (await getBulkTables({
    connectionId,
    schemas: schemasWithSelected,
  })) as ITable[][];

  return (results ?? [])
    .flat()
    .filter(table => table && !isCdcEligible(table))
    .map(table => ({ id: table.id, schemaName: table.schema_name }));
}

const updateExistingTablesValues = (extractMethod, formApi) => {
  const normalizedRiver = convertRiverToPayload(formApi.watch('river'));
  const schemas = [...normalizedRiver.properties.schemas];
  const newSchemas = schemas.map(schema => {
    const newTables = (schema.tables as any).map(({ details }) => {
      const {
        extract_method,
        date_range,
        incremental_field,
        running_number,
        table_status,
        is_selected,
        additional_target_settings,
        additional_source_settings,
        ...rest
      } = details;
      if (
        [
          IRiverExtractMethod.LOG,
          IRiverExtractMethod.CHANGE_TRACKING,
          IRiverExtractMethod.SYSTEM_VERSIONING,
        ].includes(extractMethod)
      ) {
        return {
          details: {
            ...rest,
            additional_target_settings: {
              ...additional_target_settings,
              // If the target loading method is 'overwrite', we change it to 'merge' in case of CDC/Change streams
              target_loading:
                additional_target_settings?.target_loading === 'overwrite'
                  ? 'merge'
                  : additional_target_settings?.target_loading,
            },
            is_selected,
          },
        };
      } else {
        return {
          details: {
            ...rest,
            is_selected,
            extract_method: 'all',
            date_range: null,
            incremental_field: null,
            running_number: null,
          },
        };
      }
    });

    return {
      ...schema,
      tables: newTables,
    };
  });
  const newRiverValues = {
    ...normalizedRiver,
    metadata: { ...normalizedRiver.metadata },
    properties: { ...normalizedRiver.properties, schemas: newSchemas },
  };
  formApi.setValue(
    'river',
    transformResponseToKeyValue(newRiverValues as any),
    { shouldDirty: true },
  );
};

/**
 * Configuration for extract method specific source settings
 */
const EXTRACT_METHOD_SETTINGS_CONFIG = {
  [IRiverExtractMethod.CHANGE_TRACKING]: {
    removeSettings: [],
  },
  [IRiverExtractMethod.LOG]: {
    removeSettings: ['include_deleted_rows'],
  },
  [IRiverExtractMethod.SYSTEM_VERSIONING]: {
    removeSettings: ['include_deleted_rows'],
  },
  [IRiverExtractMethod.ALL]: {
    removeSettings: ['include_deleted_rows'],
  },
} as const;

const updateExistingSourceValues = (extractMethod, formApi) => {
  const normalizedRiver = convertRiverToPayload(formApi.watch('river'));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    additional_settings = {},
    custom_query_source_settings,
    ...source
  } = normalizedRiver.properties.source;
  const methodConfig = EXTRACT_METHOD_SETTINGS_CONFIG[extractMethod];

  // Build new additional_settings based on configuration
  const newAdditionalSettings = Object.entries(additional_settings).reduce(
    (acc, [key, value]) => {
      const shouldRemove = methodConfig?.removeSettings.includes(key);
      if (!shouldRemove) {
        acc[key] = value;
      }
      return acc;
    },
    {},
  );

  const newSourceValues = {
    ...source,
    additional_settings: newAdditionalSettings,
  };

  formApi.setValue('river.properties.source', newSourceValues, {
    shouldDirty: true,
  });
};

/**
 * Custom hook to manage extract method form state
 * Encapsulates all form controllers and temporary state management
 */
function useExtractMethodForm() {
  const formApi = useSttFormContext();

  const {
    field: { value: syncOption, onChange: onSyncOptionChange },
  } = useSttController({
    name: SYNC_OPTION,
  });

  const {
    field: { value: extractMethod, onChange: onExtractMethodChange },
  } = useSttController({
    name: EXTRACT_METHOD,
  });

  const {
    field: {
      value: targetLoadingMethod,
      onChange: onTargetLoadingMethodChange,
    },
  } = useSttController({
    name: 'river.properties.target.loading_method',
  });

  const {
    field: { value: runType, onChange: onRunTypeChange },
  } = useSttController({
    name: 'river.properties.source.run_type',
    control: formApi.control,
  });

  const {
    field: { value: extractApi, onChange: onExtractApiChange },
  } = useSttController({
    name: EXTRACT_API,
  });

  const { setValue } = formApi;
  const onSchemasChange = useCallback(
    (value: Schemas) =>
      setValue('river.properties.schemas', value, { shouldDirty: true }),
    [setValue],
  );

  const [tempValues, setTempValues] = useState({
    extractMethod: runType === RunType.CUSTOM_QUERY ? null : extractMethod,
    syncOption,
    targetLoadingMethod,
    runType,
    extractApi: extractApi ?? null,
  });

  return {
    formApi,
    currentValues: {
      extractMethod,
      syncOption,
      targetLoadingMethod,
      runType,
      extractApi,
    },
    tempValues,
    setTempValues,
    formHandlers: {
      onSyncOptionChange,
      onExtractMethodChange,
      onTargetLoadingMethodChange,
      onRunTypeChange,
      onExtractApiChange,
      onSchemasChange,
    },
  };
}

/**
 * Helper to check if method is an API-based extraction
 */
const isApiMethod = (method: string) => method === 'bulk' || method === 'soap';

/**
 * Helper to determine the extract method value
 * API methods (bulk/soap) are normalized to 'all'
 */
const getExtractMethodValue = (method: string) =>
  isApiMethod(method) ? 'all' : method;

/**
 * Helper to adjust target loading method for CDC
 * CDC (LOG) extract method requires 'merge' instead of 'overwrite'
 */
const adjustTargetLoadingForCDC = (
  method: string,
  currentLoadingMethod: string,
) => {
  const isCDCMethod = method === IRiverExtractMethod.LOG;
  const isOverwrite = currentLoadingMethod === 'overwrite';
  return isCDCMethod && isOverwrite ? 'merge' : currentLoadingMethod;
};

/**
 * Business logic for handling extract method changes
 * Returns whether to show modal and the new state
 */
function handleExtractMethodChange(
  method: string,
  currentTempValues: any,
  options: { isNewRiver: boolean; targetLoadingMethod: string },
) {
  const { isNewRiver, targetLoadingMethod } = options;

  // Custom query for existing rivers requires modal confirmation
  if (method === RunType.CUSTOM_QUERY && !isNewRiver) {
    return {
      shouldShowModal: true,
      newState: currentTempValues,
    };
  }

  // Custom query for new rivers - allow direct switch.

  if (method === RunType.CUSTOM_QUERY && isNewRiver) {
    return {
      shouldShowModal: false,
      newState: {
        ...currentTempValues,
        runType: RunType.CUSTOM_QUERY,
        extractMethod: null,
        extractApi: null,
      },
    };
  }

  if (['bulk', 'soap'].includes(method)) {
    return {
      shouldShowModal: false,
      newState: {
        ...currentTempValues,
        extractApi: method,
        extractMethod: 'all',
        runType: RunType.MULTI_TABLES,
      },
    };
  }

  // Standard extraction methods
  return {
    shouldShowModal: false,
    newState: {
      runType: RunType.MULTI_TABLES,
      syncOption:
        currentTempValues.syncOption ?? SyncOption.SKIP_INITIAL_MIGRATION,
      extractMethod: getExtractMethodValue(method),
      targetLoadingMethod: adjustTargetLoadingForCDC(
        method,
        targetLoadingMethod,
      ),
      extractApi: null,
    },
  };
}

/**
 * Custom hook to handle applying extract method changes
 * Encapsulates all the logic for applying changes to the form
 */
function useApplyExtractMethodChanges(
  tempValues: any,
  formHandlers: any,
  formApi: any,
  options: {
    isNewRiver: boolean;
    onComplete: () => void;
    currentRunType?: string;
  },
) {
  const { isNewRiver, onComplete, currentRunType } = options;

  const {
    onRunTypeChange,
    onExtractMethodChange,
    onTargetLoadingMethodChange,
    onExtractApiChange,
    onSyncOptionChange,
    onSchemasChange,
  } = formHandlers;

  return useCallback(() => {
    onRunTypeChange(tempValues.runType);
    // run_type is the authority. Skip the write to avoid polluting the field with incorrect value
    if (tempValues.runType !== RunType.CUSTOM_QUERY) {
      onExtractMethodChange(tempValues.extractMethod);
    }
    onTargetLoadingMethodChange(tempValues.targetLoadingMethod);
    onExtractApiChange(tempValues.extractApi);
    const isSwitchingToCustomQuery =
      isNewRiver &&
      tempValues.runType === RunType.CUSTOM_QUERY &&
      currentRunType !== RunType.CUSTOM_QUERY;
    if (!isSwitchingToCustomQuery) {
      updateExistingTablesValues(tempValues.extractMethod, formApi);
      updateExistingSourceValues(tempValues.extractMethod, formApi);
    }
    onSyncOptionChange(tempValues.syncOption);
    if (!isNewRiver) {
      onShouldSetScheduling(formApi, tempValues.extractMethod);
    }
    if (isSwitchingToCustomQuery) {
      onSchemasChange({});
      // One-time initialization — set extract_method to 'all' only if not already chosen.
      const existing = formApi.getValues(EXTRACT_METHOD);
      if (!existing) {
        formApi.setValue(EXTRACT_METHOD, 'all', { shouldDirty: true });
      }
    }
    onComplete();
  }, [
    currentRunType,
    formApi,
    isNewRiver,
    onComplete,
    onExtractApiChange,
    onExtractMethodChange,
    onRunTypeChange,
    onSchemasChange,
    onSyncOptionChange,
    onTargetLoadingMethodChange,
    tempValues.extractApi,
    tempValues.extractMethod,
    tempValues.runType,
    tempValues.syncOption,
    tempValues.targetLoadingMethod,
  ]);
}

function ExtractModeDrawerBody({ onToggle }) {
  const [showCreateRiverAlertModal, setShowCreateRiverAlertModal] =
    useToggle(false);
  const [
    showMappingMethodChangeAlertModal,
    setShowMappingMethodChangeAlertModal,
  ] = useToggle(false);
  const [showCdcBlockerModal, setShowCdcBlockerModal] = useToggle(false);
  const [nonEligibleTables, setNonEligibleTables] = useState<
    { id: string; schemaName: string }[]
  >([]);
  const [isCheckingCdc, setIsCheckingCdc] = useToggle(false);
  const isNewRiver = useIsInNewS2TRiver();
  const source = useSttSource();
  const { getBulkTables } = useGetBulkTablesTrigger();

  // Use custom hook to manage all form state
  const { formApi, currentValues, tempValues, setTempValues, formHandlers } =
    useExtractMethodForm();

  // Use custom hook to handle applying changes
  const applyChanges = useApplyExtractMethodChanges(
    tempValues,
    formHandlers,
    formApi,
    { isNewRiver, onComplete: onToggle, currentRunType: currentValues.runType },
  );

  // Clean, focused handler for extract method changes
  const handleMethodChange = (method: string) => {
    const result = handleExtractMethodChange(method, tempValues, {
      isNewRiver,
      targetLoadingMethod: currentValues.targetLoadingMethod,
    });

    if (result.shouldShowModal) {
      setShowCreateRiverAlertModal(true);
    } else {
      setTempValues(result.newState);
    }
  };

  // Check if extract_api changed to bulk or soap
  const hasExtractApiChanged =
    tempValues.extractApi !== currentValues.extractApi &&
    ['bulk', 'soap'].includes(tempValues.extractApi);

  // Handle apply changes with modal check
  const handleApplyChanges = async () => {
    if (hasExtractApiChanged) {
      setShowMappingMethodChangeAlertModal(true);
      return;
    }

    if (tempValues.extractMethod === IRiverExtractMethod.LOG) {
      setIsCheckingCdc(true);
      try {
        const nonEligible = await getNonCdcEligibleTables(
          source?.connection_id,
          formApi.getValues('river.properties.schemas'),
          getBulkTables,
        );
        if (nonEligible.length > 0) {
          setNonEligibleTables(nonEligible);
          setShowCdcBlockerModal(true);
          return;
        }
      } finally {
        setIsCheckingCdc(false);
      }
    }

    applyChanges();
  };

  const handleRemoveNonEligible = () => {
    const nonEligibleIds = new Set(nonEligibleTables.map(t => t.id));
    const schemas = formApi.getValues('river.properties.schemas');
    const updatedSchemas = Object.fromEntries(
      Object.entries(schemas).map(([schemaName, tables]) => [
        schemaName,
        Object.fromEntries(
          Object.entries(tables as Record<string, any>).filter(
            ([tableId]) => !nonEligibleIds.has(tableId),
          ),
        ),
      ]),
    );
    formApi.setValue('river.properties.schemas', updatedSchemas, {
      shouldDirty: true,
    });
    setShowCdcBlockerModal(false);
    applyChanges();
  };

  const nonEligibleBySchema = nonEligibleTables.reduce(
    (acc, { id, schemaName }) => {
      if (!acc[schemaName]) acc[schemaName] = [];
      acc[schemaName].push(id);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return (
    <>
      <DrawerBody>
        <ExtractModeSelector
          extractMethod={tempValues.extractMethod}
          runType={tempValues.runType}
          extractApi={tempValues.extractApi}
          onExtractMethodChange={handleMethodChange}
          view="drawer"
          syncMethod={
            <Box
              className="syncMethod"
              bg="background-secondary"
              py={3}
              px={4}
              position="relative"
              display="none"
            >
              <RenderGuard
                condition={tempValues.extractMethod !== IRiverExtractMethod.LOG}
              >
                <Overlay />
              </RenderGuard>
              <Text textStyle="M6" color="primary">
                Initial Migration Process Default Settings
              </Text>
              <InitialMigrationContent
                syncOption={tempValues.syncOption}
                onSyncOptionChange={option =>
                  setTempValues({ ...tempValues, syncOption: option })
                }
                view="drawer"
              />
            </Box>
          }
        />
      </DrawerBody>
      <RiveryDrawerFooter
        handleOnClose={onToggle}
        handleOnSuccess={handleApplyChanges}
        saveLabel={
          <RiveryButton
            size="small"
            variant="primary"
            label="Apply Changes"
            isLoading={isCheckingCdc}
            onClick={handleApplyChanges}
            type="submit"
          />
        }
        cancelLabel={
          <RiveryButton
            label="Cancel"
            onClick={e => {
              e.preventDefault();
              onToggle();
            }}
            href="#"
            variant="default"
            size="small"
          />
        }
      />
      <ConfirmationModal
        title="Create Data Flow with Custom Query"
        description="Custom Query mode requires to create a new data flow."
        show={showCreateRiverAlertModal}
        onClose={() => setShowCreateRiverAlertModal(false)}
        cancelLabel={null}
        confirmLabel="OK"
        onConfirm={() => {
          setShowCreateRiverAlertModal(false);
        }}
      />
      <ConfirmationModal
        title="Some objects aren't supported in CDC mode"
        ariaLabel="cdc unsupported tables modal"
        show={showCdcBlockerModal}
        onClose={() => setShowCdcBlockerModal(false)}
        cancelLabel={null}
        customConfirm={
          <HStack justify="space-between" w="full">
            <RiveryButton
              label="Close"
              variant="default"
              size="small"
              onClick={() => setShowCdcBlockerModal(false)}
            />
            <RiveryButton
              label="Remove All & Switch"
              variant="primary"
              size="small"
              onClick={handleRemoveNonEligible}
            />
          </HStack>
        }
      >
        <Text>
          Switching from Standard to CDC will keep only the objects that CDC
          supports. The following selected objects aren't supported and will be
          unselected when you switch:
        </Text>
        <VStack align="flex-start" mt={3} spacing={2}>
          {Object.entries(nonEligibleBySchema).map(([schemaName, tableIds]) => (
            <Box key={schemaName}>
              <Text textStyle="M6">{schemaName}:</Text>
              <VStack align="flex-start" spacing={0} pl={4} mt={1}>
                {tableIds.map(id => (
                  <Text
                    key={id}
                    maxW="300px"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                  >
                    {id}
                  </Text>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      </ConfirmationModal>
      <ConfirmationModal
        title="Mapping Warning"
        description="We have recognized that extraction type was changed. This change will require to reload all tables metadata."
        show={showMappingMethodChangeAlertModal}
        onClose={() => {
          setShowMappingMethodChangeAlertModal(false);
        }}
        cancelLabel="Cancel"
        confirmLabel="Reload Metadata"
        onConfirm={() => {
          // Clear all selected tables from schemas
          formApi.setValue('river.properties.schemas', {});
          setShowMappingMethodChangeAlertModal(false);
          applyChanges();
        }}
      />
    </>
  );
}
