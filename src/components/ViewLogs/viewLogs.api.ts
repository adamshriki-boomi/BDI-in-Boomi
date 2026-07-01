import { matchPath } from 'react-router-dom';

const NO_CONTENT = 204;

const getAccountEnv = () =>
  matchPath<{ account?: string; env?: string }>(window.location.pathname, {
    path: '/:page/:account/:env',
  })?.params;

const downloadUrl = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  link.click();
};

const exportToFile = (content: string, fileName: string) => {
  const file = new File([content], fileName, { type: 'text/plain' });
  const url = window.URL.createObjectURL(file);
  downloadUrl(url, fileName);
  window.URL.revokeObjectURL(url);
};

export type DownloadLogsResult = 'ok' | 'empty';

export const downloadPullRequestLogs = async (
  pullRequestId: string,
): Promise<DownloadLogsResult> => {
  const params = getAccountEnv();
  const url = `/accounts/${params?.account}/environments/${params?.env}/pull_requests/${pullRequestId}/logs`;

  const { apiV1 } = await import('api/api.proxy');
  try {
    const res = await apiV1.get(url);
    if (res?.status === NO_CONTENT) return 'empty';
    exportToFile(res?.data, `logs_${pullRequestId}.csv`);
    return 'ok';
  } catch (e: any) {
    throw e?.response?.data ?? e;
  }
};
