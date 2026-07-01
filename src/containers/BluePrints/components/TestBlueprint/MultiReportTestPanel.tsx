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
import { useFormContext } from 'react-hook-form';
import { useAsyncFn } from 'react-use';
import {
  useAddBlueprintFileMutation,
  useCreateBlueprintMutation,
} from '../../blueprints.query';
import BlueprintLoader from '../BlueprintLoader';
import {
  allFieldsFilled,
  INTERFACE_PARAMS_BASE,
  isDateRangeFilled,
  reportDateRangePath,
  reportParamsPath,
} from './helpers';
import { InterfaceParametersAccordion } from './InterfaceParametersAccordion';
import { ReportsList } from './ReportsList';
import { useTestResults } from './useTestResults';

type Props = {
  data: any;
  refresh: () => void;
  isFetching: boolean;
};

export function MultiReportTestPanel({ data, refresh, isFetching }: Props) {
  const formApi = useFormContext();
  const [createBlueprint] = useCreateBlueprintMutation();
  const [addBlueprintFile] = useAddBlueprintFileMutation();
  const { getBlueprintRunResult, status } = useRunTestBlueprints();

  const reportsMap = (data?.reports ?? {}) as Record<string, any>;

  const results = useTestResults(status);

  const isReportRunDisabled = (reportName: string) => {
    const interfaceParamsState = formApi.getValues(
      INTERFACE_PARAMS_BASE,
    ) as any;
    const reportEntry = interfaceParamsState?.reports?.[reportName];
    const reportHasDateRange = Boolean(
      reportsMap[reportName]?.date_range?.name,
    );
    return (
      !allFieldsFilled(interfaceParamsState?.source) ||
      !allFieldsFilled(reportEntry?.source) ||
      (reportHasDateRange && !isDateRangeFilled(reportEntry?.date_range))
    );
  };

  const [{ loading }, runReportTest] = useAsyncFn(
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
      const reportDateRange = formApi.getValues(
        reportDateRangePath(reportName),
      );
      const dateRangeParam = reportsMap[reportName]?.date_range;
      const hasDateRange = Boolean(dateRangeParam?.name);
      await getBlueprintRunResult(
        blueprintRes?.data?.cross_id,
        formApi?.watch('river.properties.source.connection_id'),
        {
          interface_parameters: {
            source: [...globalSource, ...reportSource],
          },
          report_name: reportName,
          ...(hasDateRange &&
            reportDateRange && {
              date_range: {
                ...reportDateRange,
                type: dateRangeParam?.type ?? 'datetime',
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
            label="Refresh parameters"
            variant="text"
            onClick={refresh}
            leftIcon={<Icon as={RefreshIcon} />}
            disabled={loading || Boolean(results.runningTarget)}
          />
        </Box>
      </HStack>

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
