import { API } from 'api';

const POLL_INTERVAL = 2000;

export interface PullRequestParams {
  task_type: string;
  task: string;
  datasource_id: string;
  pull_request_inputs: Record<string, any>;
  generic_pull_request?: boolean;
}

export interface PollResult {
  status: string;
  result: any;
  error_message?: string;
  run_id?: string;
  operation_id?: string;
  _id?: { $oid: string };
}

/**
 * Executes a pull request and polls until completion.
 * Returns the final polling status with results or error.
 */
export async function pollPullRequest(
  pullRequest: PullRequestParams,
): Promise<PollResult> {
  const pollingHandle = await API.metadata.getMetadataV1(pullRequest);

  // Poll until the request is done
  let pollingStatus = ['R', 'W'].includes(pollingHandle.status)
    ? await API.metadata.pollMetadataV1(pollingHandle.operation_id)
    : pollingHandle;

  while (['R', 'W'].includes(pollingStatus.status)) {
    const { operation_id } = pollingStatus;
    pollingStatus = await new Promise(resolve =>
      setTimeout(
        resolve,
        POLL_INTERVAL,
        API.metadata.pollMetadataV1(operation_id),
      ),
    );
  }

  return pollingStatus;
}
