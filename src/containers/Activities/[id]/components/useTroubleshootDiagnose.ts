import { useGetTroubleshootDiagnosisQuery } from '../../store';

type RunLike =
  | {
      error_description?: string | null;
      source_name?: string | null;
      target_name?: string | null;
    }
  | null
  | undefined;

type LogItemLike = {
  task_status?: string | null;
  error_description?: string | null;
  source?: string | null;
  target?: string | null;
};

type UseTroubleshootDiagnoseParams = {
  run: RunLike;
  logItems: LogItemLike[] | null | undefined;
  runId: string | undefined;
  riverId: string | undefined;
  isAiFix: boolean;
  logHeader: string;
};

export type DiagnoseContext = {
  error_description: string;
  source: string;
  target: string;
} | null;

export function useTroubleshootDiagnose({
  run,
  logItems,
  runId,
  riverId,
  isAiFix,
  logHeader,
}: UseTroubleshootDiagnoseParams) {
  const errorTask =
    logItems?.find(item => {
      const statusValue = String(item?.task_status ?? '').toLowerCase();
      return statusValue.includes('fail') || statusValue.includes('error');
    }) ??
    logItems?.find(item => Boolean(item?.error_description)) ??
    null;

  // Prefer run-level context so the diagnose payload is stable when logItems loads
  // (avoids a second request with task-level source/target like "contacts").
  const diagnoseContext: DiagnoseContext = run?.error_description
    ? {
        error_description: run.error_description,
        source: run.source_name ?? '',
        target: run.target_name ?? '',
      }
    : errorTask
    ? {
        error_description: errorTask.error_description ?? '',
        source: errorTask.source ?? '',
        target: errorTask.target ?? '',
      }
    : null;

  const aiFixTitle =
    diagnoseContext?.source && diagnoseContext?.target
      ? `${diagnoseContext.source} -> ${diagnoseContext.target}`
      : logHeader;

  const shouldFetchTroubleshoot = Boolean(isAiFix && runId && riverId);

  const troubleshootPayload = shouldFetchTroubleshoot
    ? {
        run_id: String(runId),
        river_id: riverId!,
      }
    : undefined;

  const {
    data: troubleshootData,
    isLoading: isTroubleshootLoading,
    isError: isDiagnoseError,
    error: diagnoseErrorResponse,
  } = useGetTroubleshootDiagnosisQuery(troubleshootPayload as any, {
    skip: !shouldFetchTroubleshoot,
  });

  const diagnoseError =
    isDiagnoseError && diagnoseErrorResponse
      ? (
          diagnoseErrorResponse as {
            data?: { detail?: string };
            message?: string;
          }
        )?.data?.detail ??
        (diagnoseErrorResponse as { message?: string })?.message ??
        'Request failed'
      : null;

  return {
    diagnoseContext,
    aiFixTitle,
    troubleshootData: troubleshootData ?? null,
    isTroubleshootLoading,
    diagnoseError,
  };
}
