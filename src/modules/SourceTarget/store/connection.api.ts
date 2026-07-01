import { API } from 'api';
import { PullTestConnectionResult, RunStatus, TestResult } from 'api/types';

export const isTestSuccessful = (status: RunStatus) =>
  status === RunStatus.DONE;

export type PollTestResponse = {
  resultsList: TestResult[];
  result: string;
  isComplete: boolean;
  runId: string;
  response: PullTestConnectionResult;
};

export type TestConnectionArgs = {
  connectionId: string;
};

export async function getTestingConnectionOperationId({
  connectionId,
}: TestConnectionArgs) {
  const initiateResult = await API.connections.testConnection(connectionId);
  return initiateResult;
}
