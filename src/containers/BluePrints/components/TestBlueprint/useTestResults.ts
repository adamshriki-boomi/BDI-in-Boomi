import { useCallback, useEffect, useState } from 'react';
import { ResultSnapshot } from './helpers';

export function useTestResults(status: any) {
  const [runningTarget, setRunningTarget] = useState<string | null>(null);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [reportResults, setReportResults] = useState<
    Record<string, ResultSnapshot>
  >({});
  const [expandedByReport, setExpandedByReport] = useState<
    Record<string, boolean>
  >({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hideStaleResults, setHideStaleResults] = useState(false);
  const [activeTab, setActiveTab] = useState<number | null>(0);

  useEffect(() => {
    if (!activeTarget) return;
    if (!status?.isSuccess && !status?.isError) return;
    setReportResults(prev => ({
      ...prev,
      [activeTarget]: {
        isSuccess: Boolean(status?.isSuccess),
        isError: Boolean(status?.isError),
        data: (status as any)?.data,
        error: (status as any)?.error,
      },
    }));
    setActiveTarget(null);
  }, [activeTarget, status?.isSuccess, status?.isError, status]);

  const handleCopy = useCallback(
    async (key: string, result: ResultSnapshot) => {
      const payload = result.isSuccess ? result.data : result.error;
      try {
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(k => (k === key ? null : k)), 1500);
      } catch {
        // clipboard unavailable; nothing to do
      }
    },
    [],
  );

  return {
    runningTarget,
    setRunningTarget,
    activeTarget,
    setActiveTarget,
    reportResults,
    setReportResults,
    expandedByReport,
    setExpandedByReport,
    copiedKey,
    setCopiedKey,
    hideStaleResults,
    setHideStaleResults,
    activeTab,
    setActiveTab,
    handleCopy,
  };
}
