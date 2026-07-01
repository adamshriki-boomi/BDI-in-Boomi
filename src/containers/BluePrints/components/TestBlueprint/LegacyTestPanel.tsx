import { Box, Divider } from '@chakra-ui/react';
import {
  Flex,
  HStack,
  Icon,
  RefreshIcon,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { useRunTestBlueprints } from 'modules/SourceTarget/components/SchemaEditor/hooks';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAsyncFn } from 'react-use';
import {
  useAddBlueprintFileMutation,
  useCreateBlueprintMutation,
} from '../../blueprints.query';
import BlueprintLoader from '../BlueprintLoader';
import {
  allFieldsFilled,
  GLOBAL_RUN_KEY,
  INTERFACE_PARAMS_BASE,
  isDateRangeFilled,
  reportParamsPath,
} from './helpers';
import { InterfaceParametersAccordion } from './InterfaceParametersAccordion';
import { ReportResultPanel } from './ReportResultPanel';
import { ReportsList } from './ReportsList';
import { useTestResults } from './useTestResults';

type Props = {
  data: any;
  refresh: () => void;
  isFetching: boolean;
};

export function LegacyTestPanel({ data, refresh, isFetching }: Props) {
  const formApi = useFormContext();
  const [createBlueprint] = useCreateBlueprintMutation();
  const [addBlueprintFile] = useAddBlueprintFileMutation();
  const { getBlueprintRunResult, status } = useRunTestBlueprints();

  const reportsMap = (data?.reports ?? {}) as Record<string, any>;

  const results = useTestResults(status);

  // Global "Run Test" — sends the river-level interface_parameters + legacy
  // date_range from blueprint.date_range.
  const [{ loading }, saveHiddenBlueprint] = useAsyncFn(async () => {
    const fileRes: any = await addBlueprintFile({
      content: formApi?.watch('yaml'),
      hidden: true,
    });
    const blueprintRes: any = await createBlueprint({
      file_cross_id: fileRes?.data?.cross_id,
      name: formApi?.watch('name'),
      description: formApi?.watch('description'),
      hidden: true,
    });

    const blueprintValue: any = formApi.getValues('blueprint' as any);
    const legacyDateRange = blueprintValue?.date_range;
    const hasLegacyDateRange = Boolean(legacyDateRange?.name);
    await getBlueprintRunResult(
      blueprintRes?.data?.cross_id,
      formApi?.watch('river.properties.source.connection_id'),
      {
        interface_parameters: formApi?.watch(
          'river.properties.source.additional_settings.interface_parameters',
        ),
        ...(hasLegacyDateRange && {
          date_range: {
            ...legacyDateRange,
            type: legacyDateRange.type ?? 'datetime',
          },
        }),
      },
    );
    results.setActiveTarget(GLOBAL_RUN_KEY);
    if (
      formApi?.watch(
        'river.properties.source.additional_settings.interface_parameters',
      )
    ) {
      results.setActiveTab(1);
    }
  }, []);

  const runTest = useCallback(async () => {
    results.setHideStaleResults(false);
    results.setActiveTab(0);
    await saveHiddenBlueprint();
  }, [saveHiddenBlueprint, results]);

  const isReportRunDisabled = (reportName: string) => {
    const interfaceParamsState = formApi.getValues(
      INTERFACE_PARAMS_BASE,
    ) as any;
    const reportEntry = interfaceParamsState?.reports?.[reportName];
    const blueprintValue: any = formApi.getValues('blueprint' as any);
    const legacyDateRange = blueprintValue?.date_range;
    return (
      !allFieldsFilled(interfaceParamsState?.source) ||
      !allFieldsFilled(reportEntry?.source) ||
      !isDateRangeFilled(legacyDateRange)
    );
  };

  const [, runReportTest] = useAsyncFn(
    async (reportName: string) => {
      results.setHideStaleResults(false);
      results.setRunningTarget(reportName);
      results.setActiveTab(1);
      const fileRes: any = await addBlueprintFile({
        content: formApi?.watch('yaml'),
        hidden: true,
      });
      const blueprintRes: any = await createBlueprint({
        file_cross_id: fileRes?.data?.cross_id,
        name: formApi?.watch('name'),
        description: formApi?.watch('description'),
        hidden: true,
      });
      const globalSource =
        formApi.getValues(`${INTERFACE_PARAMS_BASE}.source`) ?? [];
      const reportSource =
        formApi.getValues(reportParamsPath(reportName)) ?? [];
      const blueprintValue: any = formApi.getValues('blueprint' as any);
      const legacyDateRange = blueprintValue?.date_range;
      const hasDateRange = Boolean(legacyDateRange?.name);
      await getBlueprintRunResult(
        blueprintRes?.data?.cross_id,
        formApi?.watch('river.properties.source.connection_id'),
        {
          interface_parameters: {
            source: [...globalSource, ...reportSource],
          },
          report_name: reportName,
          ...(hasDateRange &&
            legacyDateRange && {
              date_range: {
                ...legacyDateRange,
                type: legacyDateRange.type ?? 'datetime',
              },
            }),
        },
      );
      results.setActiveTarget(reportName);
      results.setRunningTarget(null);
    },
    [
      addBlueprintFile,
      createBlueprint,
      formApi,
      getBlueprintRunResult,
      results,
    ],
  );

  return (
    <Flex
      flexDir="column"
      gap={4}
      w="100%"
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      p={4}
      bg="body"
    >
      <Text>
        To test your Blueprint, enter valid values in all fields. <br />
        These are used only for testing and won't be saved. <br />
        Ensure all parameters are correctly filled for accurate data fetching.
      </Text>
      <Divider orientation="horizontal" bg="border" h="1px" w="full" />

      <HStack>
        <Box mr="auto">
          <RiveryButton
            label="Run Test"
            variant="outlined-primary"
            onClick={runTest}
            disabled={loading || Boolean(results.runningTarget)}
          />
        </Box>
        <Box mr="auto">
          <RiveryButton
            label="Refresh parameters"
            variant="text"
            onClick={refresh}
            leftIcon={<Icon as={RefreshIcon} />}
            disabled={loading || Boolean(results.runningTarget)}
          />
        </Box>
      </HStack>

      <RenderGuard
        condition={
          Boolean(results.reportResults[GLOBAL_RUN_KEY]) &&
          !results.hideStaleResults &&
          !loading &&
          !isFetching
        }
      >
        <ReportResultPanel
          result={results.reportResults[GLOBAL_RUN_KEY]!}
          isExpanded={Boolean(results.expandedByReport[GLOBAL_RUN_KEY])}
          onToggleExpand={() =>
            results.setExpandedByReport(prev => ({
              ...prev,
              [GLOBAL_RUN_KEY]: !prev[GLOBAL_RUN_KEY],
            }))
          }
          isCopied={results.copiedKey === GLOBAL_RUN_KEY}
          onCopy={() =>
            results.reportResults[GLOBAL_RUN_KEY] &&
            results.handleCopy(
              GLOBAL_RUN_KEY,
              results.reportResults[GLOBAL_RUN_KEY]!,
            )
          }
        />
      </RenderGuard>

      <RenderGuard
        condition={loading || isFetching}
        fallback={
          <Box
            position="relative"
            flex="1"
            overflow="auto"
            display="flex"
            flexDirection="column"
          >
            <InterfaceParametersAccordion
              isOpen={results.activeTab === 0}
              onToggle={() =>
                results.setActiveTab(results.activeTab === 0 ? null : 0)
              }
              isLoading={isFetching}
              hasData={Boolean(data)}
            />
            <ReportsList
              reportsMap={reportsMap}
              reportResults={results.reportResults}
              expandedByReport={results.expandedByReport}
              copiedKey={results.copiedKey}
              runningTarget={results.runningTarget}
              loading={loading}
              hideStaleResults={results.hideStaleResults}
              isReportRunDisabled={isReportRunDisabled}
              onRunReport={runReportTest}
              onToggleExpand={name =>
                results.setExpandedByReport(prev => ({
                  ...prev,
                  [name]: !prev[name],
                }))
              }
              onCopy={results.handleCopy}
            />
          </Box>
        }
      >
        <BlueprintLoader text="Running your test..." minW="300px" />
      </RenderGuard>
    </Flex>
  );
}
