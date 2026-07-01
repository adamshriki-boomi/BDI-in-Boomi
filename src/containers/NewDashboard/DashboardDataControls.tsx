import { Box, Flex, SimpleGrid, IconButton, Icon } from '@chakra-ui/react';
import {
  EnvironmentDropdown,
  SourceDropdown,
  DateRangeDropdown,
  TimezoneDropdown,
} from './DashboardDropdowns';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import {
  DashboardCopy,
  DownloadCsv,
  DownloadPdf,
  ResetArrow,
} from 'components/Icons/components';
import { MdMoreVert } from 'react-icons/md';
import { MetricBox } from './DashboardMetricBox';
import { ExSegmentedControls } from '@boomi/exosphere/dist/react/segmentedcontrols';
import { ExSegmentedControl } from '@boomi/exosphere/dist/react/segmentedcontrol';
import {
  useQueryParam,
  useSetQueryParams,
} from 'hooks/router/useSynchedSearchParam';
import { useDashboardRequestBody } from './hooks/useDashboardRequestBody';
import {
  useDashboardDataQuery,
  METRICS,
  VIEWS,
  TIMEZONES,
} from './dashboard.query';
import { useCore } from 'store/core';
import { getV1Url } from 'store/createRiveryApi';
import { withHeaderAuthorization } from 'api/headers';
import { useMemo, forwardRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCopyToClipboard } from 'react-use';
import { useToastComponent } from 'hooks/useToast';
import {
  convertToEpoch,
  timestampsToCalendarDates,
} from './DashboardDropdownUtils';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ExoText } from '../../components/Exosphere/ExoText';
import { DashboardChartTags, DashboardMetricTags } from 'utils/tracking.tags';
import { Tagger } from 'components/Tracking/Tagger';

const METRIC_LABELS = [
  {
    label: 'Executions',
    key: METRICS.EXECUTIONS,
    tag: DashboardMetricTags.EXECUTIONS_CARD,
  },
  {
    label: 'Success Rate',
    key: METRICS.SUCCESS_RATE,
    tag: DashboardMetricTags.SUCCESS_RATE_CARD,
  },
  {
    label: 'Boomi Data Unit (BDU) Credits',
    key: METRICS.BDU,
    tag: DashboardMetricTags.BDU_CARD,
  },
];

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function calculateMetricValue(data: any, metric: string): string {
  if (!data) return '0';

  let dataArray: any[] = [];
  if (Array.isArray(data)) {
    dataArray = data;
  } else if (data.data && Array.isArray(data.data)) {
    dataArray = data.data;
  } else if (data.time_series && Array.isArray(data.time_series)) {
    dataArray = data.time_series;
  }

  if (dataArray.length === 0) return '0';

  if (metric === METRICS.SUCCESS_RATE) {
    const totalSucceeded = dataArray.reduce(
      (sum, row) => sum + (row.succeeded ?? 0),
      0,
    );
    const totalFailed = dataArray.reduce(
      (sum, row) => sum + (row.failed ?? 0),
      0,
    );
    const total = totalSucceeded + totalFailed;

    if (total === 0) return '0%';

    const overallSuccessRate = totalSucceeded / total;
    return `${(overallSuccessRate * 100).toFixed(1)}%`;
  }

  let total = 0;
  dataArray.forEach((item: any) => {
    if (metric === METRICS.BDU) {
      total += item.units || item.bdu || 0;
    } else if (metric === METRICS.EXECUTIONS) {
      total += item.runs || item.executions || item.count || 0;
    }
  });

  return formatNumber(metric === METRICS.BDU ? Math.round(total) : total);
}

interface DashboardDataControlsProps {
  onResetHandlerReady?: (handler: () => void) => void;
}

export function DashboardDataControls({
  onResetHandlerReady,
}: DashboardDataControlsProps) {
  const [selectedMetric, setSelectedMetric] = useQueryParam('metric');
  const [viewMode, setViewMode] = useQueryParam('view');
  const baseRequestBody = useDashboardRequestBody();
  const { selectedAccountId } = useCore();

  const selectedMetricKey = selectedMetric || METRICS.EXECUTIONS;
  const selectedView = viewMode || VIEWS.GENERAL;

  const metric = METRIC_LABELS.find(m => m.key === selectedMetricKey);
  const metricLabel = metric?.label || 'Executions';

  const executionsRequest = useMemo(
    () => ({
      ...baseRequestBody,
      metric: METRICS.EXECUTIONS,
      view: VIEWS.GENERAL,
    }),
    [baseRequestBody],
  );
  const bduRequest = useMemo(
    () => ({
      ...baseRequestBody,
      metric: METRICS.BDU,
      view: VIEWS.GENERAL,
    }),
    [baseRequestBody],
  );
  const successRateRequest = useMemo(
    () => ({
      ...baseRequestBody,
      metric: METRICS.SUCCESS_RATE,
      view: VIEWS.GENERAL,
    }),
    [baseRequestBody],
  );
  const {
    data: executionsData,
    isLoading: executionsLoading,
    isFetching: executionsFetching,
  } = useDashboardDataQuery(executionsRequest, {
    refetchOnMountOrArgChange: true,
  });
  const {
    data: bduData,
    isLoading: bduLoading,
    isFetching: bduFetching,
  } = useDashboardDataQuery(bduRequest, {
    refetchOnMountOrArgChange: true,
  });
  const {
    data: successRateData,
    isLoading: successRateLoading,
    isFetching: successRateFetching,
  } = useDashboardDataQuery(successRateRequest, {
    refetchOnMountOrArgChange: true,
  });
  const metricValues = useMemo(() => {
    return {
      [METRICS.EXECUTIONS]: calculateMetricValue(
        executionsData,
        METRICS.EXECUTIONS,
      ),
      [METRICS.SUCCESS_RATE]: calculateMetricValue(
        successRateData,
        METRICS.SUCCESS_RATE,
      ),
      [METRICS.BDU]: calculateMetricValue(bduData, METRICS.BDU),
    };
  }, [executionsData, bduData, successRateData]);

  const previousPeriodValues = useMemo(() => {
    return {
      [METRICS.EXECUTIONS]: calculateMetricValue(
        executionsData?.previous_kpis != null
          ? { data: executionsData.previous_kpis }
          : null,
        METRICS.EXECUTIONS,
      ),
      [METRICS.SUCCESS_RATE]: calculateMetricValue(
        successRateData?.previous_kpis != null
          ? { data: successRateData.previous_kpis }
          : null,
        METRICS.SUCCESS_RATE,
      ),
      [METRICS.BDU]: calculateMetricValue(
        bduData?.previous_kpis != null ? { data: bduData.previous_kpis } : null,
        METRICS.BDU,
      ),
    };
  }, [executionsData, bduData, successRateData]);

  const metricLoadingStates = useMemo(() => {
    return {
      [METRICS.EXECUTIONS]: executionsLoading || executionsFetching,
      [METRICS.SUCCESS_RATE]: successRateLoading || successRateFetching,
      [METRICS.BDU]: bduLoading || bduFetching,
    };
  }, [
    executionsLoading,
    executionsFetching,
    bduLoading,
    bduFetching,
    successRateLoading,
    successRateFetching,
  ]);

  const setQueryParams = useSetQueryParams();
  const [timezoneParam, setTimezoneParam] = useQueryParam('timezone');
  const [startTimeParam, setStartTimeParam] = useQueryParam('start_time');
  const [endTimeParam, setEndTimeParam] = useQueryParam('end_time');
  const [environmentsParam] = useQueryParam('environments');
  const [sourcesParam] = useQueryParam('sources');
  const [metricParam] = useQueryParam('metric');
  const [viewParam] = useQueryParam('view');
  const location = useLocation();
  const [, copyToClipboard] = useCopyToClipboard();
  const { success, error } = useToastComponent();

  const handleCopyShareLink = useCallback(() => {
    let finalStartTime = startTimeParam;
    let finalEndTime = endTimeParam;
    let finalTimezone = timezoneParam;

    if (timezoneParam === TIMEZONES.LOCAL) {
      setTimezoneParam(TIMEZONES.UTC);
      finalTimezone = TIMEZONES.UTC;

      if (startTimeParam && endTimeParam) {
        const calendarDates = timestampsToCalendarDates(
          Number(startTimeParam),
          Number(endTimeParam),
          TIMEZONES.LOCAL,
        );

        const newStartTime = convertToEpoch(
          calendarDates.startDate,
          TIMEZONES.UTC,
        );
        const newEndTime = convertToEpoch(calendarDates.endDate, TIMEZONES.UTC);

        setStartTimeParam(newStartTime.toString());
        setEndTimeParam(newEndTime.toString());
        finalStartTime = newStartTime.toString();
        finalEndTime = newEndTime.toString();
      }
    }

    const params = new URLSearchParams();
    if (environmentsParam) params.set('environments', environmentsParam);
    if (sourcesParam) params.set('sources', sourcesParam);
    if (finalStartTime) params.set('start_time', finalStartTime);
    if (finalEndTime) params.set('end_time', finalEndTime);
    if (finalTimezone) params.set('timezone', finalTimezone);
    if (metricParam) params.set('metric', metricParam);
    if (viewParam) params.set('view', viewParam);

    const queryString = params.toString();
    const currentUrl = `${window.location.origin}${location.pathname}${
      queryString ? `?${queryString}` : ''
    }`;
    copyToClipboard(currentUrl);

    success({ description: 'Link copied to clipboard (Timezone UTC)' });
  }, [
    timezoneParam,
    setTimezoneParam,
    startTimeParam,
    endTimeParam,
    setStartTimeParam,
    setEndTimeParam,
    environmentsParam,
    sourcesParam,
    metricParam,
    viewParam,
    location,
    copyToClipboard,
    success,
  ]);

  const handleResetToDefault = useCallback(() => {
    setQueryParams({
      environments: null,
      sources: null,
      start_time: null,
      end_time: null,
      timezone: null,
      view: null,
    });
  }, [setQueryParams]);

  const handleDownloadCsv = useCallback(async () => {
    if (!selectedAccountId) return;

    const csvPayload = {
      start_time: baseRequestBody.start_time,
      end_time: baseRequestBody.end_time,
      view: baseRequestBody.view,
      ...(baseRequestBody.environments &&
        baseRequestBody.environments.length > 0 && {
          environments: baseRequestBody.environments,
        }),
      ...(baseRequestBody.sources &&
        baseRequestBody.sources.length > 0 && {
          sources: baseRequestBody.sources,
        }),
    };

    try {
      const baseUrl = `${getV1Url()}/accounts/${selectedAccountId}/dashboard/export_csv`;
      const headers = new Headers();
      withHeaderAuthorization(true)(headers, { getState: () => ({}) });

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          ...Object.fromEntries(headers.entries()),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(csvPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          (Array.isArray(errorData?.detail) && errorData.detail[0]?.msg) ||
          errorData?.detail ||
          errorData?.message ||
          'Export failed';
        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      let filename = 'Dashboard view export.csv';
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (filenameMatch && filenameMatch[1]) {
          const headerFilename = filenameMatch[1].replace(/['"]/g, '');
          if (headerFilename === 'export.csv') {
            filename = 'Dashboard view export.csv';
          } else {
            filename = headerFilename;
          }
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('CSV export error:', err);
      error({
        title: 'Export Failed',
        description:
          err instanceof Error ? err.message : 'Failed to export CSV',
      });
    }
  }, [baseRequestBody, selectedAccountId, error]);

  const handleDownloadPdf = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));

    const element = document.getElementById('dashboard-activity-overview');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => {
        img.onload = resolve;
      });

      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save('Dashboard_Activity_Overview.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
    }
  }, []);

  useEffect(() => {
    if (onResetHandlerReady) {
      onResetHandlerReady(handleResetToDefault);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onResetHandlerReady]);

  const dropdownOptions = value => (
    <ExoText styleName="Body Small 1 UI">{value}</ExoText>
  );

  const menuItems = [
    {
      value: (
        <Flex alignItems="center">
          <Icon
            as={DashboardCopy}
            boxSize="24px"
            mr={2}
            mb={0.5}
            color="background-selected"
          />
          {dropdownOptions('Copy Share Link (UTC)')}
        </Flex>
      ),
      onClick: handleCopyShareLink,
    },
    {
      value: (
        <Flex alignItems="center">
          <Icon
            as={DownloadCsv}
            boxSize="24px"
            mr={2}
            mb={0.5}
            color="background-selected"
          />
          {dropdownOptions('Download CSV')}
        </Flex>
      ),
      onClick: handleDownloadCsv,
    },
    {
      value: (
        <Flex alignItems="center">
          <Icon
            as={DownloadPdf}
            boxSize="24px"
            mr={2}
            mb={0.5}
            color="background-selected"
          />
          {dropdownOptions('Download PDF')}
        </Flex>
      ),
      onClick: handleDownloadPdf,
    },
    {
      value: (
        <Flex alignItems="center">
          <Icon
            as={ResetArrow}
            boxSize="21px"
            mr={2}
            mb={0.5}
            color="background-selected"
          />
          {dropdownOptions('Reset to Default')}
        </Flex>
      ),
      onClick: handleResetToDefault,
    },
  ];

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={4}>
        <EnvironmentDropdown />
        <SourceDropdown />
        <DateRangeDropdown />
        <Flex align="flex-end" gap={2}>
          <Box flex={1}>
            <TimezoneDropdown />
          </Box>
          <RiveryDropdown
            menuItems={menuItems}
            customMenuButton={forwardRef((props: any, ref: any) => (
              <IconButton
                ref={ref}
                {...props}
                aria-label="More options"
                icon={<Icon as={MdMoreVert} boxSize={5} />}
                variant="ghost"
                size="md"
              />
            ))}
          />
        </Flex>
      </SimpleGrid>

      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 3 }}
        gap="var(--exo-spacing-large, 24px)"
        mb={4}
      >
        {METRIC_LABELS.map(m => (
          <Tagger key={m.key} tags={m.tag}>
            <MetricBox
              label={m.label}
              value={metricValues[m.key as keyof typeof metricValues]}
              selected={selectedMetricKey === m.key}
              onClick={() => setSelectedMetric(m.key)}
              isLoading={
                metricLoadingStates[m.key as keyof typeof metricLoadingStates]
              }
              showPreviousKpiChange={baseRequestBody.include_previous}
              previousPeriodValue={
                previousPeriodValues[m.key as keyof typeof previousPeriodValues]
              }
            />
          </Tagger>
        ))}
      </SimpleGrid>

      <Flex align="center" justify="space-between">
        <ExoText styleName="Subhead 1 Bold">
          Data Flows Activity View By {metricLabel}
        </ExoText>
        <ExSegmentedControls
          onSelectionChange={(e: any) => {
            const index =
              e?.detail?.index ??
              e?.detail?.selectedIndex ??
              e?.detail?.selected;
            const newView = index === 0 ? VIEWS.GENERAL : VIEWS.SOURCE;
            setViewMode(newView);
          }}
        >
          <ExSegmentedControl
            aria-label="general-view-toggle"
            label="General View"
            selected={selectedView === VIEWS.GENERAL}
            data-pendo-id={DashboardChartTags.GENERAL_VIEW_TOGGLE}
          />
          <ExSegmentedControl
            aria-label="source-view-toggle"
            label="Source View"
            selected={selectedView === VIEWS.SOURCE}
            data-pendo-id={DashboardChartTags.SOURCE_VIEW_TOGGLE}
          />
        </ExSegmentedControls>
      </Flex>
    </Box>
  );
}
