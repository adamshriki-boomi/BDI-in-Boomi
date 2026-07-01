import { Accordion } from '@chakra-ui/react';
import { Flex, RenderGuard, Text } from 'components';
import { ResultSnapshot } from './helpers';
import { ReportCard } from './ReportCard';

type Props = {
  reportsMap: Record<string, any>;
  reportResults: Record<string, ResultSnapshot>;
  expandedByReport: Record<string, boolean>;
  copiedKey: string | null;
  runningTarget: string | null;
  loading: boolean;
  hideStaleResults: boolean;
  isReportRunDisabled: (reportName: string) => boolean;
  onRunReport: (reportName: string) => void;
  onToggleExpand: (reportName: string) => void;
  onCopy: (reportName: string, result: ResultSnapshot) => void;
};

export function ReportsList({
  reportsMap,
  reportResults,
  expandedByReport,
  copiedKey,
  runningTarget,
  loading,
  hideStaleResults,
  isReportRunDisabled,
  onRunReport,
  onToggleExpand,
  onCopy,
}: Props) {
  const reportNames = Object.keys(reportsMap);
  return (
    <RenderGuard condition={reportNames.length > 0}>
      <Flex flexDir="column" gap={1} flexShrink={0} mt={2}>
        <Text textStyle="M6" color="brand" pl={4}>
          Reports
        </Text>
        <Accordion allowMultiple>
          {reportNames.map(name => {
            const fieldsIncomplete = isReportRunDisabled(name);
            const isThisRunning = runningTarget === name;
            const result = reportResults[name];
            return (
              <ReportCard
                key={name}
                name={name}
                params={reportsMap[name]}
                fieldsIncomplete={fieldsIncomplete}
                runDisabled={
                  fieldsIncomplete || Boolean(runningTarget) || loading
                }
                isRunning={isThisRunning}
                onRun={() => onRunReport(name)}
                result={result}
                showResult={
                  Boolean(result) && !hideStaleResults && !isThisRunning
                }
                isExpanded={Boolean(expandedByReport[name])}
                onToggleExpand={() => onToggleExpand(name)}
                isCopied={copiedKey === name}
                onCopy={() => result && onCopy(name, result)}
              />
            );
          })}
        </Accordion>
      </Flex>
    </RenderGuard>
  );
}
