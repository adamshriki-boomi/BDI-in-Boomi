import { chakra } from '@chakra-ui/react';
import { ExtractMethod, SourceTypes } from 'api/types';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  GridBox,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from 'components';
import {
  useGetRiverCommonProps,
  useIsBlueprint,
  useIsSupportedPredefinedReports,
  useMainFormColumnsDefinitions,
  useSttFormContext,
  useSttSource,
  useTableField,
} from 'modules/SourceTarget/components/form';
import {
  getCachedReportParams,
  useLegacyBlueprintDateRange,
} from 'containers/BluePrints/helpers';
import { IReport, ISelectedTable } from 'modules/SourceTarget/store';
import { useGetTablesQuery } from 'modules/SourceTarget/store/schemas.query';
import * as React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FormProvider } from 'react-hook-form';
import { useGetSchemaTable } from '../rows.state.api';
import {
  initiateMongoTableSettings,
  useTableSettingsForm,
  useTableSettingsFormContext,
} from './form.hooks';
import { Mapping } from './Mapping';
import { TableSourceSettings } from './TableSourceSettings';
import { TableTargetSettings } from './TableTargetSettings';
import { EXTRACT_API } from 'modules/SourceTarget/components/form/form.consts';

const TableSettingsTabsContext = createContext<{
  setTabIndex: (index: number) => void;
  emptyMappingRedirectedRef: React.MutableRefObject<boolean>;
}>({
  setTabIndex: () => {},
  emptyMappingRedirectedRef: { current: false },
});

export const useTableSettingsTabs = () => useContext(TableSettingsTabsContext);

export function TableSettingsDrawer({ table, isOpen, onClose }) {
  const formApi = useSttFormContext();
  const isBlueprint = useIsBlueprint();
  const blueprintId = formApi?.watch(
    'river.properties.source.additional_settings.recipe_id',
  );
  const extract_api = formApi?.watch(EXTRACT_API);
  const isPredefinedReport = useIsSupportedPredefinedReports();
  const { original } = table.row;
  const { source, isPredefined } = table.column.getProps.riverProperties;

  // Fetch fresh table data to ensure we have the latest increment_columns
  const sourceDefinition = useSttSource();
  const { schemaName, tableName } = useGetSchemaTable(
    original,
    source,
    isPredefined,
  );

  const { data: freshTableData } = useGetTablesQuery(
    {
      connectionId: sourceDefinition?.connection_id,
      schema_name: schemaName,
      tableIds: [original.id],
      ...(extract_api && { extract_api }),
    },
    {
      skip: !sourceDefinition?.connection_id || !schemaName || !original.id,
    },
  );

  // Use fresh data if available, otherwise fall back to original
  const tableDefinitions = freshTableData?.items?.[0] || original;

  const apiSchemaName = isPredefinedReport ? 'no_schema' : schemaName;
  const apiTableName = isPredefinedReport
    ? (original as IReport).report_id
    : tableName;
  const visibleName = isPredefinedReport
    ? (original as IReport).report_name
    : tableName;
  const { value, update } = useTableField(apiSchemaName, apiTableName);
  const { isCDC } = useGetRiverCommonProps();
  const btnRef = React.useRef();
  const [tabIndex, setTabIndex] = useState(0);
  const emptyMappingRedirectedRef = useRef(false);
  const tabsContextValue = useMemo(
    () => ({ setTabIndex, emptyMappingRedirectedRef }),
    [setTabIndex],
  );
  const { setDateRange: setLegacyDateRange, isLegacy } =
    useLegacyBlueprintDateRange();
  const onApplyChanges = useCallback(
    value => {
      //need to remove the fields that relate to the incremental type once the type is changed to standard
      const { incremental_field, start_value, end_value, ...restFields } =
        value;
      const isIncremental =
        restFields?.extract_method === ExtractMethod.INCREMENTAL;
      update(isIncremental ? value : restFields);
      if (isLegacy && isIncremental && value?.date_range) {
        setLegacyDateRange(value.date_range);
      }
      onClose();
    },
    [isLegacy, onClose, setLegacyDateRange, update],
  );
  const analyzeTable = formApi?.watch(
    'river.properties.target.additional_settings.analyze_table',
  );
  return (
    <GridBox>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        variant="semifull"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottom="1px" borderColor="gray.300">
            {visibleName}
          </DrawerHeader>

          <TableSettingsTabsContext.Provider value={tabsContextValue}>
            <TableFormProvider
              value={value}
              connectionId={sourceDefinition.connection_id}
              definitions={
                isBlueprint
                  ? {
                      ...tableDefinitions,
                      blueprintId,
                      report_name: (original as any)?.id,
                    }
                  : tableDefinitions
              }
              isCDC={isCDC}
              analyzeTable={analyzeTable}
            >
              <DrawerBody>
                <TableSettingsTabs
                  tabIndex={tabIndex}
                  setTabIndex={setTabIndex}
                />
              </DrawerBody>
              <DrawerFooter
                justifyContent="space-between"
                borderColor="gray.300"
                borderTop="1px"
                height="57px"
              >
                <Button size="sm" variant="outline" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <ApplyChangesButton onClick={onApplyChanges} />
              </DrawerFooter>
            </TableFormProvider>
          </TableSettingsTabsContext.Provider>
        </DrawerContent>
      </Drawer>
    </GridBox>
  );
}

export const TableFormProvider = ({
  value,
  connectionId,
  definitions,
  blueprintId = null,
  isCDC = false,
  analyzeTable = true,
  children,
}) => {
  const formMethods = useTableSettingsForm({
    defaultValues: {
      table: {
        modified_columns: [],
        ...value,
        ...(definitions?.database_properties?.type === SourceTypes.MONGO &&
          initiateMongoTableSettings(value)),
      },
      definitions,
      connectionId,
      blueprintId,
      isCDC,
      analyzeTable,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!formMethods?.watch('definitions') && definitions?.id) {
      ///Adding schema name to definitions in case it's a blueprint/recipe, just for fake structure
      formMethods.setValue(
        'definitions',
        {
          ...definitions,
          ...(definitions?.datasource_id === SourceTypes.BLUEPRINT && {
            schema_name: 'no_schema',
          }),
        },
        { shouldDirty: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definitions]);

  // Update increment_columns when they change (e.g., after metadata reload)
  useEffect(() => {
    const currentDefinitions = formMethods?.watch('definitions');
    if (
      currentDefinitions &&
      definitions?.increment_columns &&
      JSON.stringify(currentDefinitions?.increment_columns) !==
        JSON.stringify(definitions?.increment_columns)
    ) {
      formMethods.setValue(
        'definitions.increment_columns',
        definitions.increment_columns,
        {
          shouldDirty: false,
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definitions?.increment_columns]);
  return <FormProvider {...formMethods}>{children}</FormProvider>;
};

const ApplyChangesButton = ({ onClick }) => {
  const formMethods = useTableSettingsFormContext();
  const blueprintId = formMethods.watch('definitions.blueprintId');
  const reportName = formMethods.watch('definitions.report_name');
  const isBlueprint = Boolean(blueprintId);
  const cachedParams = isBlueprint
    ? getCachedReportParams(blueprintId, reportName)
    : null;
  const interfaceParams = formMethods.watch(
    'table.additional_source_settings.interface_parameters.source',
  );

  const isInterfaceParamsValid = (() => {
    if (!isBlueprint) return true;
    const requiredNames: string[] = (
      (cachedParams?.required_params ?? []) as string[]
    ).filter(n => n !== 'date_range' && n !== 'authentication');
    if (requiredNames.length === 0) return true;
    const declaredByName = new Map<string, any>(
      ((cachedParams?.standard ?? []) as any[]).map(p => [p.name, p]),
    );
    const savedByName = new Map<string, any>(
      ((interfaceParams ?? []) as any[]).map(p => [p.name, p.value]),
    );
    const isEmpty = (v: any) => v === undefined || v === null || v === '';
    return requiredNames.every(name => {
      const saved = savedByName.get(name);
      if (!isEmpty(saved)) return true;
      return !isEmpty(declaredByName.get(name)?.value);
    });
  })();

  const applySettings = React.useCallback(() => {
    const form = formMethods.watch();
    onClick(normalizeValues(form.table));
  }, [formMethods, onClick]);

  return (
    <Button
      size="sm"
      variant="primary"
      onClick={applySettings}
      isDisabled={!isInterfaceParamsValid}
    >
      Apply Changes
    </Button>
  );
};

const normalizeValues = (data: ISelectedTable) => {
  const entriesWithValues = Object.entries(data).filter(([, value]) =>
    Array.isArray(value) ? value.length > 0 : value !== undefined,
  );
  return Object.fromEntries(entriesWithValues);
};

const tabs = _isBlueprint => ({
  Mapping,
  'Table Source Settings': TableSourceSettings,
  'Table Target Settings': TableTargetSettings,
});

export function TableSettingsTabs({ tabIndex, setTabIndex }) {
  const { isBlueprint } = useMainFormColumnsDefinitions();
  const formMethods = useTableSettingsFormContext();
  const definitions = formMethods?.watch('definitions') as any;
  const blueprintId = definitions?.blueprintId;
  const reportName = definitions?.report_name;
  const cachedParams = isBlueprint
    ? getCachedReportParams(blueprintId, reportName)
    : null;
  const hideSourceSettings =
    isBlueprint &&
    Boolean(cachedParams) &&
    (cachedParams?.standard?.length ?? 0) === 0 &&
    !cachedParams?.date_range?.name;
  const columnTabs = useMemo(() => {
    const all = tabs(isBlueprint);
    if (hideSourceSettings) {
      const { 'Table Source Settings': _omitted, ...rest } = all;
      return rest;
    }
    return all;
  }, [isBlueprint, hideSourceSettings]);
  return (
    <Tabs
      isLazy
      isManual
      height="full"
      display="grid"
      gridTemplateRows="min-content 1fr"
      index={tabIndex}
      onChange={setTabIndex}
    >
      <TabList>
        {Object.keys(columnTabs).map(tab => (
          <Tab key={`table-settings-tabs-${tab}`} py="3">
            {tab}
          </Tab>
        ))}
      </TabList>

      <TabPanels overflow="auto" height="full">
        {Object.values(columnTabs).map((TabComponent, index) => (
          <TabPanel key={`tab-panels-step-${index}`} h="full">
            <chakra.fieldset display="contents">
              <TabComponent />
            </chakra.fieldset>
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
