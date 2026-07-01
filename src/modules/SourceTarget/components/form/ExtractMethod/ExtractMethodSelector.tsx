import { SourceTypes } from 'api/types';
import {
  Box,
  Crown,
  CustomQueryIcon,
  Flex,
  Icon,
  RdsChangeTracking,
  RdsLogExt,
  RdsStandardExt,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { EnableFeatureModal } from 'containers/Login/components/EnableFeatureModal';
import {
  useDataSourcesSections,
  useIsCustomQuerySupported,
} from 'modules/Datasources';
import { useIsStandardExtractionSupported } from 'modules/SourceTarget';
import { useGetSchemaTableNameCaption } from 'modules/SourceTarget/hooks';
import { IRiverExtractMethod } from 'modules/SourceTarget/store';
import { useFormContext } from 'react-hook-form';
import { useToggle } from 'react-use';
import { useAccount } from 'store/core';
import { S2TTags } from 'utils/tracking.tags';
import { useIsSupportedBW, useIsSupportedCDC } from '../../SchemaEditor';
import { RunType } from '../form.consts';

const wrapperStyle = {
  modal: {
    mt: 8,
  },
  drawer: {
    mt: 0,
    flexDir: 'column',
  },
};

export function ExtractModeSelector({
  onExtractMethodChange,
  extractMethod = null,
  runType = null,
  extractApi = null,
  view = 'modal',
  syncMethod = null,
}) {
  const isModalView = view === 'modal';
  const formApi = useFormContext();
  const isCDCSupported = useIsSupportedCDC();
  const isBWSupported = useIsSupportedBW();
  const sourceName = formApi?.watch('river.properties.source.name');
  const { selectedDataSource } = useDataSourcesSections('source', sourceName);
  const { tableNameCaptionPlural } = useGetSchemaTableNameCaption();

  const { showCustomQuery, newUICustomQuery } = useIsCustomQuerySupported();

  const showStandardextraction = useIsStandardExtractionSupported();
  return (
    <Flex
      justify="center"
      w="full"
      h="fit-content"
      overflow="auto"
      px={isModalView ? '20px' : 0}
      {...(isModalView ? wrapperStyle.modal : wrapperStyle.drawer)}
    >
      <Flex
        gap={isModalView ? 6 : 4}
        flexDir={isModalView ? 'row' : 'column'}
        flexWrap={isModalView ? 'wrap' : 'nowrap'}
        justifyContent="center"
        sx={
          isModalView
            ? {
                '@media (max-width: 1919px)': {
                  maxW: '770px',
                },
              }
            : undefined
        }
      >
        {!isModalView && (
          <Text color="font-secondary">
            Select the method you would like to extract your data.
          </Text>
        )}
        <RenderGuard condition={isCDCSupported}>
          <InitialMigrationContent
            extractMethod={extractMethod}
            syncMethod={syncMethod}
            isModalView={isModalView}
          >
            <ExtractMethodButton
              type="log"
              extractMethod={extractMethod}
              setExtractMethod={onExtractMethodChange}
              isModalView={isModalView}
              data-pendo-id={S2TTags.CDC_BUTTON}
              icon={RdsLogExt}
              header={
                selectedDataSource?.feature_flags.log_title ||
                'CDC (Change Data Capture)'
              }
              description={selectedDataSource?.feature_flags.log_description}
              hoverDescription={
                <HoverDescriptionWithLink
                  description="Database Log"
                  documentation={selectedDataSource?.feature_flags.log_doc}
                />
              }
            />
          </InitialMigrationContent>
        </RenderGuard>
        <RenderGuard condition={showStandardextraction}>
          <ExtractMethodButton
            type="all"
            extractMethod={extractMethod}
            setExtractMethod={onExtractMethodChange}
            isModalView={isModalView}
            icon={RdsStandardExt}
            header="Standard Extraction"
            description={`Extracts data directly from selected ${tableNameCaptionPlural} using the default extraction logic`}
          />
        </RenderGuard>
        <RenderGuard condition={isBWSupported}>
          <ExtractMethodButton
            type="bw_extractor"
            extractMethod={extractMethod}
            setExtractMethod={onExtractMethodChange}
            isModalView={isModalView}
            icon={RdsStandardExt}
            header="BW Extraction"
            description="SAP BW DataSource extraction with SAP-managed delta. Handles inserts, updates, deletes and reversals automatically."
          />
        </RenderGuard>
        <RenderGuard
          condition={[SourceTypes.MSSQL].includes(
            selectedDataSource.id as SourceTypes,
          )}
        >
          <ExtractMethodButton
            type="change_tracking"
            extractMethod={extractMethod}
            setExtractMethod={onExtractMethodChange}
            isModalView={isModalView}
            icon={RdsChangeTracking}
            header="Change Tracking"
            description="Tracks and captures any change that occur in your Rows by its Primary Key"
            hoverDescription={
              <HoverDescriptionWithLink
                description="Change Tracking tables"
                documentation="https://help.boomi.com/docs/Atomsphere/Data_Integration/Sources/Databases/MicrosoftSQLServer/RiverConfigurations/sql-server-change-tracking"
              />
            }
          />
        </RenderGuard>
        <RenderGuard
          condition={[SourceTypes.MARIADB].includes(
            selectedDataSource.id as SourceTypes,
          )}
        >
          <ExtractMethodButton
            type="system_versioning"
            extractMethod={extractMethod}
            setExtractMethod={onExtractMethodChange}
            isModalView={isModalView}
            icon={RdsChangeTracking}
            header="System Versioning"
            description="Tracks and captures any change that occur in your Rows by its Primary Key- required to be enabled for each table."
            hoverDescription={
              <HoverDescriptionWithLink
                description="System-Versioned tables"
                documentation="https://help.boomi.com/docs/Atomsphere/Data_Integration/Sources/Databases/MariaDB/walkthrough-mariadb"
              />
            }
          />
        </RenderGuard>

        <RenderGuard condition={sourceName === SourceTypes.SALESFORCE}>
          <ExtractMethodButton
            type="bulk"
            extractApi={extractApi}
            setExtractMethod={onExtractMethodChange}
            isModalView={isModalView}
            icon={RdsStandardExt}
            header="Bulk API"
            description="The preferred way to extract large sets of data from Salesforce, has a limitation of 10,000 batch in a 24 hours sliding window"
          />
          <ExtractMethodButton
            type="soap"
            extractApi={extractApi}
            setExtractMethod={onExtractMethodChange}
            isModalView={isModalView}
            icon={RdsStandardExt}
            header="SOAP API"
            description="SOAP uses soap API to retrieve data, this method is usually slower than the bulk API"
          />
        </RenderGuard>
        <RenderGuard condition={showCustomQuery && newUICustomQuery}>
          <ExtractMethodButton
            type="custom_query"
            runType={runType}
            setExtractMethod={onExtractMethodChange}
            isModalView={isModalView}
            icon={CustomQueryIcon}
            header="Custom Query"
            description="Extract data using your own SQL query for full control and flexibility"
          />
        </RenderGuard>
      </Flex>
    </Flex>
  );
}

function HoverDescriptionWithLink({ description, documentation }) {
  return (
    <>
      Before using this option, please ensure your {description} are configured
      correctly. View our{' '}
      <RiveryButton
        label="documentation"
        variant="link"
        href={documentation}
        target="_blank"
        onClick={e => e.stopPropagation()}
      />{' '}
      for help.
    </>
  );
}

const buttonStyle = {
  modal: {
    flexDir: 'column',
    w: '370px',
    h: '210px',
    py: 6,
    px: 12,
    gap: 0,
  },
  drawer: {
    w: 'full',
    h: 'fit-content',
    py: 5,
    px: 4,
    gap: 6,
  },
  hover: {
    bg: 'purple.10',
    boxShadow:
      '0px 4px 6px -1px rgba(0, 0, 0, 0.10), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)',
    borderColor: 'purple.500',
    color: 'primary',
    fontWeight: '500!important',
    '.description': { color: 'purple.100' },
  },
  selected: {
    bg: 'purpleOpacity',
    boxShadow:
      '0px 4px 6px -1px rgba(0, 0, 0, 0.10), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)',
    borderColor: 'gray.200',
    color: 'primary',
  },
};

function ExtractMethodButton({
  type,
  extractMethod = undefined,
  extractApi = undefined,
  runType = undefined,
  setExtractMethod,
  isModalView,
  icon,
  header,
  description,
  hoverDescription = null,
  ...props
}) {
  const { cdcBlocked } = useIsAllowedCDCSource(type);
  const [openUpgradeModal, toggleUpgradeModal] = useToggle(false);
  const selected =
    type === RunType.CUSTOM_QUERY
      ? runType === RunType.CUSTOM_QUERY
      : extractMethod === type || extractApi === type;
  return (
    <Flex
      position="relative"
      flexDir="column"
      aria-label={header}
      border="1px"
      borderColor="gray.300"
      borderRadius={4}
      role="group"
      color="font"
      cursor="pointer"
      _hover={{
        ...buttonStyle.hover,
        ...(hoverDescription && {
          '.default-desc': { opacity: 0 },
          '.hover-desc': { opacity: 1 },
        }),
      }}
      _active={{
        ...buttonStyle.selected,
        '.description': { color: 'purple.100!important' },
      }}
      {...(!isModalView &&
        selected && {
          ...buttonStyle.hover,
        })}
      onClick={() => {
        if (cdcBlocked) {
          toggleUpgradeModal(true);
          return;
        }
        setExtractMethod(type);
      }}
      {...(isModalView ? buttonStyle.modal : buttonStyle.drawer)}
      {...props}
    >
      <RenderGuard condition={cdcBlocked}>
        <Icon
          as={Crown}
          boxSize="22px"
          position="absolute"
          right="12px"
          top="8px"
        />
      </RenderGuard>
      <Flex
        {...(isModalView
          ? { flexDir: 'column' }
          : { alignItems: 'center', gap: 6 })}
      >
        <Icon
          as={icon}
          boxSize={isModalView ? '56px' : '48px'}
          mb={isModalView ? 3 : 0}
          color="exo-color-icon"
          {...(isModalView && { alignSelf: 'center' })}
        />
        <Flex flexDir="column">
          <Text
            textAlign={isModalView ? 'center' : 'left'}
            fontSize="md"
            color="font"
          >
            {header}
          </Text>
          <Box position="relative" minH={isModalView ? '60px' : 'auto'}>
            <Text
              textStyle="R7"
              color="font-secondary"
              textAlign={isModalView ? 'center' : 'left'}
              className="description default-desc"
              transition="opacity 0.2s ease-in-out"
            >
              {description}
            </Text>
            {hoverDescription && (
              <Text
                textStyle="R7"
                color="font-secondary"
                textAlign={isModalView ? 'center' : 'left'}
                className="description hover-desc"
                position="absolute"
                top={0}
                left={0}
                right={0}
                opacity={0}
                transition="opacity 0.2s ease-in-out"
              >
                {hoverDescription}
              </Text>
            )}
          </Box>
        </Flex>
      </Flex>
      <EnableFeatureModal
        feature="oracleCdc"
        show={openUpgradeModal}
        toggle={toggleUpgradeModal}
      />
    </Flex>
  );
}

const useIsAllowedCDCSource = type => {
  const formApi = useFormContext();
  const { isSettingOn } = useAccount();
  const { selectedDataSource } = useDataSourcesSections(
    'source',
    formApi?.watch('river.properties.source.name'),
  );
  //Currently only for oracle
  const isOracle = selectedDataSource.id === SourceTypes.ORACLE;
  const enableOracleCDC = isSettingOn('enable_oracle_cdc');
  const cdcBlocked =
    type === IRiverExtractMethod.LOG && isOracle && !enableOracleCDC;

  return { cdcBlocked };
};

function InitialMigrationContent({
  children,
  extractMethod,
  syncMethod = null,
  isModalView,
}) {
  return (
    <Flex
      flexDir="column"
      {...(extractMethod === IRiverExtractMethod.LOG && {
        sx: { '.syncMethod': { display: 'block !important', mt: 2 } },
      })}
    >
      {children}
      <RenderGuard condition={!isModalView}>
        <Box>{syncMethod}</Box>
      </RenderGuard>
    </Flex>
  );
}
