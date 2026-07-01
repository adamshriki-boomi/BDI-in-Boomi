import { SourceTypes, TargetTypesV1 } from 'api/types';
import {
  Center,
  Divider,
  Flex,
  Grid,
  HStack,
  Icon,
  PageOverlaySpinner,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import SvgMultiTablesIcon from 'components/Icons/components/MultiTablesIcon';
import SvgRdsCustomReports from 'components/Icons/components/RdsCustomReports';
import SvgRdsPredefined from 'components/Icons/components/RdsPredefined';
import {
  useDataSourcesSections,
  useIsCustomQuerySupported,
} from 'modules/Datasources';
import { useGetTarget } from 'modules/Datasources/useLogicTargets';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import { ConfirmationCustomQuery } from 'modules/SourceTarget/components/SchemaEditor/ConfirmationCustomQuery';
import { IRiverExtractMethod, SchemaItem } from 'modules/SourceTarget/store';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useGetSchemaTableNameCaption } from '../../hooks';
import {
  useIsBlueprint,
  useIsCustomQuery,
  useIsSupportedPredefinedReports,
  useShouldDisplayExtractMethod,
  useSttController,
  useSttFormContext,
  useSttSource,
  useSttTarget,
} from '../form';
import { ExtractModeSelector } from '../form/ExtractMethod/ExtractMethodSelector';
import { EXTRACT_API, EXTRACT_METHOD, RunType } from '../form/form.consts';
import BlueprintsReportsExplorer from './BluePrints/BlueprintsReportsExplorer';
import CustomQueryView from './CustomQuery';
import {
  useReloadMetadata,
  useReloadTablesMetadataForNoSchemaStructure,
} from './hooks';
import { ReportsExplorer } from './PredefinedReports';
import { SchemaExplorer } from './SchemaExplorer';
import { BulkActions } from './SchemaTables/components/bulk-actions/BulkActions';
import { ExtractMethodDrawer } from './SchemaTables/components/ExtractMethod';
import { SchemaDefinitions } from './SchemaTables/components/SchemaDefinitions';
import { useReachedTablesLimit } from './SchemaTables/components/TableLimitMessage';
import { ReloadMetadataForNoSchemaStructure } from './SchemaTables/TableSettings/components/ReloadTableMetadata';
import { ReloadMetadataDropdown } from './SchemaTables/TableSettings/Mapping/ReloadMetadataButton';

const defaultLabels = {
  log: 'CDC (Change Data Capture)',
  all: 'Standard Extraction',
  bw_extractor: 'BW Extraction',
};

const changeTracking = {
  change_tracking: 'Change Tracking',
};
const systemVersioning = {
  system_versioning: 'System Versioning',
};
const bulkApi = {
  bulk: 'Bulk API',
};
const soapApi = {
  soap: 'SOAP API',
};

const methodLabel = {
  [SourceTypes.MONGO]: { log: 'Change Streams', all: defaultLabels.all },
  [SourceTypes.MSSQL]: { ...defaultLabels, ...changeTracking },
  [SourceTypes.MARIADB]: { ...defaultLabels, ...systemVersioning },
  [SourceTypes.SALESFORCE]: { ...defaultLabels, ...bulkApi, ...soapApi },
};

export const useIsSupportedCDC = () => {
  const source = useSttSource();
  const { selectedDataSource } = useDataSourcesSections('source', source?.name);
  const target = useSttTarget();
  const selectedTarget = useGetTarget(target?.name);
  const targetSupportCDC = selectedTarget?.target_settings?.enable_cdc;
  const sourceSupportCDC = selectedDataSource?.feature_flags?.allow_log;
  return !target ? null : sourceSupportCDC && targetSupportCDC;
};

export const useIsSupportedBW = () => {
  const source = useSttSource();
  const { selectedDataSource } = useDataSourcesSections('source', source?.name);
  return selectedDataSource?.feature_flags?.allow_bw;
};

export function SchemaEditor() {
  const isNewRiver = useIsInNewS2TRiver();
  const [schemaInView, setViewingSchema] = useState<SchemaItem>();
  const formApi = useFormContext();
  const source = useSttSource();
  const schemas = useWatch({
    control: formApi.control,
    name: 'river.properties.schemas',
  });
  const { currentTablesLength } = useReachedTablesLimit(schemas);
  const {
    field: { value: extractMethod, onChange: setExtractMethodInForm },
  } = useSttController({
    name: EXTRACT_METHOD,
  });
  const {
    field: { value: runType, onChange: setRunType },
  } = useSttController({
    name: 'river.properties.source.run_type',
  });
  const {
    field: { value: extractApi, onChange: setExtractApi },
  } = useSttController({
    name: EXTRACT_API,
  });
  const { selectedDataSource } = useDataSourcesSections('source', source?.name);
  const defaultPredefined = useIsSupportedPredefinedReports();
  const isBlueprint = useIsBlueprint();
  const isCustomQuery = useIsCustomQuery();
  const { reloadSchemas, loading, isError, errorMessage, warningMessage } =
    useReloadMetadata(formApi, schemaInView?.name, setViewingSchema);
  const { reloadTables, loading: tablesLoading } =
    useReloadTablesMetadataForNoSchemaStructure();
  const { noSchemaStructure } = useGetSchemaTableNameCaption();
  const shouldDisplayExtractMethodsScreen =
    useShouldDisplayExtractMethod() && !extractMethod;
  const { showCustomQuery, newUICustomQuery } = useIsCustomQuerySupported();

  const onExtractMethodChange = (method: string) => {
    if (method === RunType.CUSTOM_QUERY) {
      setRunType(RunType.CUSTOM_QUERY);
      setExtractApi(null);
      return;
    }
    if (['bulk', 'soap'].includes(method)) {
      setRunType(RunType.MULTI_TABLES);
      setExtractMethodInForm('all');
      setExtractApi(method);
      return;
    }
    if (method === IRiverExtractMethod.BW) {
      setRunType(RunType.MULTI_TABLES);
      setExtractMethodInForm(method);
      setExtractApi(method);
      return;
    }
    setRunType(RunType.MULTI_TABLES);
    setExtractMethodInForm(method);
    setExtractApi(null);
  };

  const targetName = formApi?.watch('river.properties.target.name');
  const isKHTarget = targetName === TargetTypesV1.KNOWLEDGE_HUB;

  // KH target only supports standard extraction
  useEffect(() => {
    if (isKHTarget && !extractMethod) {
      setExtractMethodInForm('all');
      setRunType(RunType.MULTI_TABLES);
    }
  }, [isKHTarget, extractMethod, setExtractMethodInForm, setRunType]);

  if (!isNewRiver && !formApi?.watch('river.cross_id')) {
    return <PageOverlaySpinner />;
  }
  const showLegacyCustomQuery = isNewRiver && showCustomQuery && !isKHTarget;

  if (isBlueprint) {
    return (
      <Grid height="full" w="full">
        <BlueprintsReportsExplorer
          targetType={formApi?.watch('river.properties.target.name')}
        />
      </Grid>
    );
  }

  if (defaultPredefined) {
    return (
      <Grid height="full" w="full">
        <Predefined />
      </Grid>
    );
  }

  if (isCustomQuery) {
    return <CustomQueryView />;
  }

  return (
    <Grid
      width="full"
      gridTemplateRows="min-content min-content min-content 1fr"
      gridGap="2"
      height="full"
    >
      <Grid
        templateAreas="
        'icon title switcher'
        'icon title switcher'
        "
        h="auto"
        gridGap="2"
        gridTemplateColumns="min-content 1fr auto"
      >
        <RenderGuard condition={!shouldDisplayExtractMethodsScreen}>
          <Center
            gridArea="icon"
            boxSize={8}
            bg="background-selected-weak"
            borderRadius={50}
          >
            <Icon as={SvgMultiTablesIcon} color="primary" boxSize="18px" />
          </Center>
        </RenderGuard>
        <RenderGuard condition={!shouldDisplayExtractMethodsScreen}>
          <SchemaEditorTitle source={source.name} />
        </RenderGuard>
        <RenderGuard condition={showLegacyCustomQuery && !newUICustomQuery}>
          <LegacyCustomQuery />
        </RenderGuard>
      </Grid>
      <RenderGuard
        condition={
          Boolean(selectedDataSource) && shouldDisplayExtractMethodsScreen
        }
      >
        {/* hide the title when the extraction mode selection is hidden */}
        <Text textStyle="R5" textAlign="center">
          Select extraction mode
        </Text>
      </RenderGuard>
      {/* We only show this selection when the form has no value of extract method */}
      <RenderGuard
        condition={shouldDisplayExtractMethodsScreen}
        fallback={
          <>
            <Divider color="border" />

            {/* Only show toolbar when we're in the schema explorer phase */}
            <RenderGuard condition={Boolean(selectedDataSource)}>
              <Grid
                pt={2}
                pb={3}
                gridGap={1}
                gridTemplateAreas="'extract definitions reload'"
                gridTemplateColumns="min-content min-content 1fr"
              >
                <ExtractMethodDrawer />
                <SchemaDefinitions />
                <Flex ml="auto" alignItems="center" gap={2} gridArea="reload">
                  <BulkActions disabled={currentTablesLength < 2} />
                  <RenderGuard
                    condition={noSchemaStructure}
                    fallback={
                      <ReloadMetadataDropdown
                        schemaInView={schemaInView}
                        reloadSchemas={reloadSchemas}
                        setViewingSchema={setViewingSchema}
                      />
                    }
                  >
                    <ReloadMetadataForNoSchemaStructure
                      onReload={reloadTables}
                      loading={tablesLoading}
                    />
                  </RenderGuard>
                </Flex>
              </Grid>
            </RenderGuard>

            <SchemaExplorer
              loading={loading || tablesLoading}
              reloadSchemas={reloadSchemas}
              error={isError}
              errorMessage={errorMessage}
              warningMessage={warningMessage}
              schemaInView={schemaInView}
              onChange={setViewingSchema}
              extractMethod={extractMethod}
            />
          </>
        }
      >
        <ExtractModeSelector
          onExtractMethodChange={onExtractMethodChange}
          extractMethod={extractMethod}
          runType={runType}
          extractApi={extractApi}
        />
      </RenderGuard>
    </Grid>
  );
}

const runTypeToTitle = {
  [RunType.MULTI_TABLES]: 'Multi Tables',
  [RunType.CUSTOM_QUERY]: 'Custom Query',
};

function SchemaEditorTitle({ source }) {
  const formApi = useSttFormContext();
  const extractMethod = formApi?.watch(EXTRACT_METHOD);
  const runType = formApi?.watch('river.properties.source.run_type');
  const extractApi = formApi?.watch(EXTRACT_API);
  const isCDCSupported = useIsSupportedCDC();
  // Default to "Standard Extraction" when extract method is not explicitly set
  // (multi-table rivers store extract_method per-table, not on additional_settings)
  const displayMethod = extractApi
    ? extractApi
    : extractMethod ||
      (isCDCSupported === false || runType === 'multi_tables'
        ? IRiverExtractMethod.ALL
        : null);
  const displayLabel = displayMethod
    ? methodLabel[source]?.[displayMethod] ||
      defaultLabels[displayMethod] ||
      'Standard Extraction'
    : null;

  const displayTitle = runTypeToTitle[runType];

  return (
    <Grid gridArea="title">
      <HStack textAlign="left">
        <Text textStyle="M5">{displayTitle}</Text>

        {displayLabel && (
          <HStack>
            <Text textStyle="R5" color="font-secondary">
              |
            </Text>
            <Text textStyle="R6" color="font-secondary">
              {' '}
              {displayLabel}
            </Text>
          </HStack>
        )}
      </HStack>
    </Grid>
  );
}

function LegacyCustomQuery() {
  return (
    <Flex alignItems="center" gridArea="switcher" gap={1}>
      <Text textStyle="R7" color="font-secondary">
        Switch Mode to
      </Text>
      <ConfirmationCustomQuery />
    </Flex>
  );
}

function CustomReport() {
  return (
    <Flex alignItems="center" gridArea="switcher" gap="4">
      <Text textStyle="R8" color="font-secondary">
        Switch Mode to
      </Text>
      <RiveryButton
        label="Custom Reports"
        leftIcon={<Icon as={SvgRdsCustomReports} color="inherit" boxSize={4} />}
        variant="outlined-primary"
        size="small"
      />
    </Flex>
  );
}

function PredefinedTitle() {
  return (
    <Grid gridArea="title">
      <HStack textAlign="left" color="primary">
        <Text textStyle="M5">Predefined Reports</Text>
      </HStack>
      <Text textStyle="R7" color="font-secondary" textAlign="left">
        Select multiple Predefined Reports with a predefined set of fields
        simultaneously
      </Text>
    </Grid>
  );
}

function Predefined() {
  const isNewRiver = useIsInNewS2TRiver();
  return (
    <Grid
      width="full"
      gridTemplateRows="min-content min-content auto 1fr"
      gridGap="4"
      height="full"
    >
      <Grid
        templateAreas="
      'icon title switcher'
      'icon title switcher'
      "
        h="auto"
        gridGap="4"
        gridTemplateColumns="min-content 1fr auto"
      >
        <Icon
          as={SvgRdsPredefined}
          color="primary"
          boxSize="12"
          gridArea="icon"
        />
        <PredefinedTitle />
        <RenderGuard condition={isNewRiver}>
          <CustomReport />
        </RenderGuard>
      </Grid>
      <Grid
        gridGap="4"
        gridTemplateAreas="'reload . extract definitions'"
        gridTemplateColumns="auto 1fr repeat(2, min-content)"
      >
        <SchemaDefinitions />
      </Grid>
      <Divider color="gray.300" height="min-content" />
      <Grid overflow="hidden">
        <ReportsExplorer />
      </Grid>
    </Grid>
  );
}
