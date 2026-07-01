import * as React from 'react';
import { FormProvider, useFormContext } from 'react-hook-form';
import { InfoTooltip, RdsSchemaSelected, Text } from 'components';
import { Box, Divider, Flex, Grid, VStack } from '@chakra-ui/react';
import {
  BulkCDCExtractionModeLabels,
  BulkCDCExtractionModeValues,
  BulkExtractMethodStandardLabels,
  BulkExtractMethodStandardValues,
  BulkStandardLoadingMergeMethodLabels,
  BulkStandardLoadingMergeMethodValues,
  BulkStandardLoadingModeMethodLabels,
  BulkStandardLoadingModeMethodValues,
  BulkStandardLoadingModeValues,
  BulkTableSelectionTypeLabels,
  BulkTableSelectionTypeValues,
  mapValueToLabel,
} from '../consts';
import { resolveDateValue } from '../../DateTimePopover';
import RiveryAlert from 'components/Alert/Alert';
import { RiveryAccordion } from 'layout/Sidebar/components/RiveryAccordion';
import { storageTargets } from 'api/types';

export function BulkSummaryConfirmation() {
  const formApi = useFormContext();
  return (
    <Flex flexDir="column">
      <FormProvider {...formApi}>
        <BulkSummaryTablesSelected />
      </FormProvider>
    </Flex>
  );
}

function GetAmountOfTablesAffected() {
  const formApi = useFormContext();
  const form = formApi.watch();
  const { selectionType, schema, selectedSchemas } = form;
  switch (selectionType) {
    case BulkTableSelectionTypeValues.SCHEMAS:
      const selectedTablesBySchema = Object.entries(schema)
        .filter(([schemaKey]) => selectedSchemas.includes(schemaKey)) // Filter schemas based on selectedSchemas
        .flatMap(([schemaKey, schemaObj]) => {
          return Object.values(schemaObj).filter(
            table => typeof table !== 'boolean' && table.is_selected,
          );
        });
      return selectedTablesBySchema.length;
    case BulkTableSelectionTypeValues.ALL:
      const selectedTablesByAll = Object.values(schema)
        .flatMap(Object.values)
        .filter(table => typeof table !== 'boolean' && table.is_selected);
      return selectedTablesByAll.length;
    case BulkTableSelectionTypeValues.SPECIFIC:
      const specificTables = form.specificTables;
      const selectedTablesBySpecific = Object.values(specificTables)
        .flatMap(Object.values)
        .filter(Boolean);
      return selectedTablesBySpecific.length;
    case BulkTableSelectionTypeValues.CONDITIONS:
      const filteredTables = form.filteredTables;
      const selectedTablesByConditions = Object.values(filteredTables)
        .flatMap(Object.values)
        .filter(Boolean);
      return selectedTablesByConditions.length;
    default:
      return 0;
  }
}

const BulkSummaryTablesSelected = () => {
  const formApi = useFormContext();
  const tablesSumText = () => {
    const selectionType = formApi.watch('selectionType');
    const text = mapValueToLabel(
      BulkTableSelectionTypeValues,
      BulkTableSelectionTypeLabels,
      selectionType,
    );
    return `${text} (Total tables: ${GetAmountOfTablesAffected()})`;
  };

  const SummaryBlockTwoRows = ({ title, value, description }) => {
    return (
      <Grid
        templateRows="40px auto"
        templateColumns="200px 1fr"
        bg="background-secondary"
        w="100%"
        borderRadius={4}
        mt={3}
        alignItems="center"
      >
        <Text p="5px" textStyle="M7">
          {title}
        </Text>
        <Text>{value}</Text>
        <Box gridColumn="span 2">
          <Divider orientation="horizontal" bg="gray.200" />
        </Box>
        <Box></Box>
        <Text paddingBlock={3}>{description}</Text>
      </Grid>
    );
  };

  const SummaryBlockOneRow = ({ title, value, description = undefined }) => {
    return (
      <Grid
        templateRows="auto"
        templateColumns="200px 170px 1fr"
        bg="background-secondary"
        w="100%"
        borderRadius={4}
        h="50px"
        alignItems="center"
      >
        <Text textStyle="M7" p={2}>
          {title}
        </Text>
        <Text>{value}</Text>
        <Flex justifyContent="start">{description}</Flex>
      </Grid>
    );
  };

  function SummaryList() {
    const form = formApi.watch();
    const { isCDC, actions, table } = form;
    const initialMigration = actions.initialMigration ?? false;
    const targetName = formApi.watch('targetName');
    const isStorage = storageTargets.includes(targetName);
    const blocksToRender = [];

    // region cdc
    if (isCDC) {
      if (initialMigration) {
        const migrationMode = actions.migrationMode;
        const description =
          migrationMode === BulkCDCExtractionModeValues.OVERWRITE
            ? BulkCDCExtractionModeLabels.OVERWRITE
            : BulkCDCExtractionModeLabels.MERGE;
        blocksToRender.push(
          <SummaryBlockTwoRows
            title="Extracion Mode"
            value="Initial Migration"
            description={description}
          />,
        );
      } else {
        blocksToRender.push(
          <SummaryBlockOneRow
            title="Extraction Mode"
            value="Keep Original Settings"
          />,
        );
      }
    }
    // endregion

    // region standard
    const extractMethod = actions.extractMethod;
    if (!isCDC) {
      switch (extractMethod) {
        case BulkExtractMethodStandardValues.KEEP:
        case BulkExtractMethodStandardValues.ALL:
          blocksToRender.push(
            <SummaryBlockOneRow
              title="Extract Method Settings"
              value={mapValueToLabel(
                BulkExtractMethodStandardValues,
                BulkExtractMethodStandardLabels,
                extractMethod,
              )}
            />,
          );
          break;
        case BulkExtractMethodStandardValues.INCREMENTAL:
          function getRunningNumberString(
            start: number,
            end: number,
            include_end_value: boolean,
          ): string {
            return `${start} \u21C0 ${include_end_value ? end : end - 1}`;
          }

          let incrementalValues: string;
          let title: string;
          if (table.hasOwnProperty('date_range')) {
            incrementalValues = resolveDateValue(table.date_range, '');
            title = 'Timestamp';
          } else if (table.hasOwnProperty('epoch')) {
            incrementalValues = getRunningNumberString(
              table.epoch?.start_value,
              table.epoch?.end_value,
              table.epoch?.include_end_value,
            );
            title = 'Epoch';
          } else {
            const runningNumber = table.running_number;
            incrementalValues = getRunningNumberString(
              runningNumber?.start_value,
              runningNumber?.end_value,
              runningNumber?.include_end_value,
            );
            title = 'Running Number';
          }
          const incrementalDescription = (
            <Grid templateColumns="170px 1fr" templateRows="35px 35px 35px">
              <Text>Incremental Field</Text>
              <Text>{table.incremental_field}</Text>
              <Text>Incremental Type</Text>
              <Text>{title}</Text>
              <Text>Incremental Values</Text>
              <Text>{incrementalValues}</Text>
            </Grid>
          );
          blocksToRender.push(
            <SummaryBlockTwoRows
              title="Extract Method Settings"
              value={mapValueToLabel(
                BulkExtractMethodStandardValues,
                BulkExtractMethodStandardLabels,
                extractMethod,
              )}
              description={incrementalDescription}
            />,
          );
          break;
        case BulkExtractMethodStandardValues.TIME:
          const timePeriod = actions.timePeriod;
          const timeDescription = (
            <Grid templateColumns="170px 1fr">
              <Text>Time Period</Text>
              <Text>{resolveDateValue(timePeriod, '')}</Text>
            </Grid>
          );

          blocksToRender.push(
            <SummaryBlockTwoRows
              title="Extract Method Settings"
              value={mapValueToLabel(
                BulkExtractMethodStandardValues,
                BulkExtractMethodStandardLabels,
                extractMethod,
              )}
              description={timeDescription}
            />,
          );
      }
    }

    const loadingMode = actions.loadingMode;
    if (!isCDC && !isStorage) {
      if (loadingMode === BulkStandardLoadingModeValues.KEEP) {
        blocksToRender.push(
          <SummaryBlockOneRow
            title="Loading Mode"
            value="Keep Original Settings"
          />,
        );
      } else {
        const loadingMethod = mapValueToLabel(
          BulkStandardLoadingModeMethodValues,
          BulkStandardLoadingModeMethodLabels,
          actions.loadingMethod,
        );
        const mergeMethod =
          loadingMethod === BulkStandardLoadingModeMethodLabels.MERGE
            ? mapValueToLabel(
                BulkStandardLoadingMergeMethodValues,
                BulkStandardLoadingMergeMethodLabels,
                actions.mergeMethod,
              )
            : undefined;
        blocksToRender.push(
          <SummaryBlockOneRow
            title="Loading Mode"
            value={loadingMethod}
            description={mergeMethod}
          />,
        );
      }
    }
    // endregion

    // region calculated columns
    const calculatedColumns = actions.newCalculatedColumns;
    const value = calculatedColumns.length ? (
      `${calculatedColumns.length} Added`
    ) : (
      <Text color="font-secondary">None Added</Text>
    );
    const calculatedColumnsDesctiption = (
      <VStack>
        {calculatedColumns.map(item => (
          <Text alignItems="start" key={item.name}>
            {item.name}
          </Text>
        ))}
      </VStack>
    );
    blocksToRender.push(
      <SummaryBlockOneRow
        title="Calculated Columns"
        value={value}
        description={calculatedColumnsDesctiption}
      />,
    );
    // endregion

    return (
      <VStack>
        {blocksToRender.map((block, index) => (
          <React.Fragment key={index}>{block}</React.Fragment>
        ))}
      </VStack>
    );
  }

  function getSummaryTablesSelected() {
    const selectionType = formApi.watch('selectionType');
    switch (selectionType) {
      case BulkTableSelectionTypeValues.CONDITIONS:
        return formApi.watch('filteredTables');
      case BulkTableSelectionTypeValues.ALL:
        const schema = formApi.watch('schema');
        return Object.entries(schema).reduce((acc, [schemaKey, tables]) => {
          const selectedTables = Object.entries(tables).reduce(
            (tableAcc, [tableName, tableData]) => {
              if (
                typeof tableData === 'object' &&
                tableData !== null &&
                tableData.is_selected === true
              ) {
                tableAcc[tableName] = true;
              }
              return tableAcc;
            },
            {},
          );
          if (Object.keys(selectedTables).length > 0) {
            acc[schemaKey] = selectedTables;
          }
          return acc;
        }, {});
      case BulkTableSelectionTypeValues.SCHEMAS:
        const selectedSchemas = formApi.watch('selectedSchemas');
        const allSchemas = formApi.watch('schema');
        return selectedSchemas.reduce((acc, schemaKey) => {
          if (allSchemas[schemaKey]) {
            const selectedTables = Object.entries(allSchemas[schemaKey]).reduce(
              (tableAcc, [tableName, tableData]) => {
                if (
                  typeof tableData === 'object' &&
                  tableData !== null &&
                  (tableData as any).is_selected === true
                ) {
                  tableAcc[tableName] = true;
                }
                return tableAcc;
              },
              {},
            );

            if (Object.keys(selectedTables).length > 0) {
              acc[schemaKey] = selectedTables;
            }
          }
          return acc;
        }, {});
      case BulkTableSelectionTypeValues.SPECIFIC:
        const specificTables = formApi.watch('specificTables');
        return Object.entries(specificTables).reduce(
          (acc, [schema, tables]) => {
            const selectedTables = Object.entries(tables)
              .filter(([_, isSelected]) => isSelected)
              .reduce(
                (tableAcc, [table, value]) => ({ ...tableAcc, [table]: value }),
                {},
              );

            if (Object.keys(selectedTables).length > 0) {
              acc[schema] = selectedTables;
            }
            return acc;
          },
          {},
        );
    }
  }

  return (
    <Flex flexDir="column" gap={4}>
      <RiveryAlert
        variant="warning-light"
        icon={InfoTooltip}
        description="You are about to apply bulk actions. This operation will effect multiple items and cannot be undone. Please review your changes carefully before proceeding."
      />
      <Flex justifyContent="space-between">
        <Text color="primary" textStyle="M6">
          Tables Selected
        </Text>
        <Text textStyle="M7">{tablesSumText()}</Text>
      </Flex>
      <RiveryAccordion
        topLevelIcon={RdsSchemaSelected}
        field={{ value: getSummaryTablesSelected() }}
        treeOnly
        editable={false}
      />
      <Divider orientation="horizontal" w="100%" bg="gray.300" my={6} />
      <Flex flexDir="column">
        <Text color="primary" textStyle="M6" pb={2}>
          Bulk Actions
        </Text>
        <SummaryList />
      </Flex>
    </Flex>
  );
};
