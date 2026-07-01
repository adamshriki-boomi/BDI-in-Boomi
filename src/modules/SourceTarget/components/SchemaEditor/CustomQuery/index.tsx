import {
  Center,
  ContainerSplitter,
  Divider,
  Flex,
  HStack,
  Icon,
  RiveryButton,
  Spinner,
  Text,
} from 'components';
import Run from 'components/Icons/components/Run';
import {
  MergeReplaceAction,
  MergeReplaceModal,
} from 'components/Form/MergeReplaceModal';
import SvgCustomQueryIcon from 'components/Icons/components/CustomQueryIcon';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import { useCallback, useState } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { storageTargets } from 'api/types';
import { ExtractMethodDrawer } from '../SchemaTables/components/ExtractMethod';
import { CustomQueryCodeEditor } from './CustomQueryCodeEditor';
import {
  SourceDefinitionsDrawer,
  TargetDefinitionsDrawer,
} from './CustomQueryDefinitionDrawers';
import { CustomQueryFlowChart } from './CustomQueryFlowChart';
import { CustomQueryMapping } from './CustomQueryMapping';
import { useCustomQueryMapping } from './useCustomQueryMapping';

function CustomQueryTitle() {
  return (
    <HStack>
      <Center boxSize={8} bg="background-selected-weak" borderRadius={50}>
        <Icon as={SvgCustomQueryIcon} color="primary" boxSize="18px" />
      </Center>
      <Text textStyle="M5">Custom Query</Text>
    </HStack>
  );
}

export default function CustomQueryView() {
  const formApi = useFormContext();
  const isNewRiver = useIsInNewS2TRiver();
  const [showMergeReplaceModal, setShowMergeReplaceModal] = useState(false);

  const { field: sqlCommand } = useController({
    name: 'river.properties.source.custom_query_source_settings.query',
    control: formApi.control,
  });

  // Get target name to check if it's a storage target
  const targetName = useWatch({
    control: formApi.control,
    name: 'river.properties.target.name',
  });

  const isStorageTarget = storageTargets.includes(targetName);

  // Get saved mapping from river form (for existing rivers)
  const { field: savedMapping } = useController({
    name: 'river.properties.target.single_table_settings.mapping',
    control: formApi.control,
  });

  const { runMapping, loading, result, queryChanged, hasExistingMapping } =
    useCustomQueryMapping();

  // Use new mapping result if available, otherwise use saved mapping
  const mappingData = result || savedMapping.value;

  // Show warning when query changed since last mapping
  const queryWarning = queryChanged
    ? 'Query updated. Run mapping again.'
    : undefined;

  // Handle run mapping button click
  const handleRunMappingClick = useCallback(() => {
    // Check if there's actually mapping data (not just hasExistingMapping flag)
    // User might have deleted all columns, in which case there's nothing to merge
    const hasCurrentMapping =
      savedMapping.value && savedMapping.value.length > 0;

    if (hasExistingMapping && hasCurrentMapping) {
      // Show confirmation modal if there's existing mapping with columns
      setShowMergeReplaceModal(true);
    } else {
      // No existing mapping or all columns deleted, proceed with replace directly
      runMapping('replace');
    }
  }, [hasExistingMapping, runMapping, savedMapping.value]);

  // Handle merge/replace modal action
  const handleMergeReplaceAction = useCallback(
    (action: MergeReplaceAction) => {
      setShowMergeReplaceModal(false);

      if (action !== 'cancel') {
        runMapping(action);
      }
    },
    [runMapping],
  );

  // Upper Section: Title, Buttons, FlowChart, SQL Editor
  const upperSection = (
    <Flex flexDir="column" gap={4} p={4} overflow="auto">
      <Flex flexDir="column" gap={2}>
        <CustomQueryTitle />
        <Divider color="border" />
      </Flex>
      <HStack justifyContent="space-between">
        <Flex gap={2}>
          {isNewRiver && <ExtractMethodDrawer />}
          <SourceDefinitionsDrawer />
          <TargetDefinitionsDrawer />
        </Flex>
        {!isStorageTarget && (
          <RiveryButton
            label="Run Mapping"
            variant="default"
            leftIcon={
              loading ? (
                <Spinner size="sm" />
              ) : (
                <Icon as={Run} color="inherit" />
              )
            }
            onClick={handleRunMappingClick}
            disabled={loading || !sqlCommand.value}
          />
        )}
      </HStack>
      <CustomQueryCodeEditor
        title="SQL Query"
        titleModal="Custom Query - SQL"
        fileName="custom_query.sql"
        value={sqlCommand.value}
        type="SQL"
        path="custom-query-sql"
        language="sql"
        minLines={isStorageTarget ? 6 : 4}
        maxLines={isStorageTarget ? 6 : 4}
        onChange={sqlCommand.onChange}
        warningMessage={queryWarning}
      />
      <CustomQueryFlowChart />
    </Flex>
  );

  // If storage target, don't show mapping section at all
  if (isStorageTarget) {
    return (
      <>
        <Flex flexDir="column" h="full" w="full" overflow="auto">
          {upperSection}
        </Flex>
      </>
    );
  }

  return (
    <>
      <ContainerSplitter
        orientation="horizontal"
        overflow="hidden"
        h="full"
        firstChildProps={{ minSize: 110, flex: 0.6 }}
      >
        {upperSection}

        {/* Lower Section: Mapping Table */}
        <Flex pt={2} flexDir="column" h="full" overflow="hidden">
          <CustomQueryMapping
            mappingResult={mappingData}
            isLoading={loading}
            isFreshResult={!!result}
          />
        </Flex>
      </ContainerSplitter>

      <MergeReplaceModal
        show={showMergeReplaceModal}
        onAction={handleMergeReplaceAction}
      />
    </>
  );
}
