import { pollPullRequest } from 'modules/SourceTarget/components/SchemaEditor/CustomQuery/pollPullRequest';

export interface PullRequestContext {
  connectionId: string;
  datasourceId: string;
  [key: string]: any;
}

export type PullRequestOptions = { value: string | number; label: string }[];

export async function fetchPullRequestOptions(
  task: string,
  pullRequestContext: PullRequestContext | undefined,
  idColumn: string,
  nameColumn: string,
): Promise<PullRequestOptions> {
  if (!task || !pullRequestContext) return [];
  const { connectionId, datasourceId, id, ...additionalInputs } =
    pullRequestContext;
  const status = await pollPullRequest({
    task_type: 'source',
    task,
    datasource_id: datasourceId,
    generic_pull_request: true,
    pull_request_inputs: {
      connection_id: connectionId,
      table_id: id,
      ...additionalInputs,
    },
  });
  if (status.status === 'D' && Array.isArray(status.result)) {
    return status.result.map(item => ({
      value: item[idColumn],
      label: item[nameColumn] ?? String(item[idColumn] ?? ''),
    }));
  }
  if (status.status === 'F') {
    throw new Error(status.error_message ?? 'Request failed');
  }
  return [];
}
