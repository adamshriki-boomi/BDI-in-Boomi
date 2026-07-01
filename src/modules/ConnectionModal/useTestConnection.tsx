import { useBoolean } from '@chakra-ui/react';
import { API } from 'api';
import { IConnection, PullTestConnectionResult, TestResponse } from 'api/types';
import { useCancelPullRequestRun } from 'containers/River/RiverSourceToTarget/components/RiverActivation/hooks';
import { getTestingConnectionOperationId } from 'modules/SourceTarget';
import { useCallback, useState } from 'react';
import { useAsyncFn, useInterval } from 'react-use';
import { getId } from 'utils/api.sanitizer';
const POLL_INTERVAL = 1000;

export function useTestConnection(
  connectionType: string,
  connection?: IConnection,
) {
  const { cancel: cancelTest } = useCancelPullRequestRun();
  const [testResult, setTestResult] = useState<
    PullTestConnectionResult | TestResponse
  >();
  const [testId, setTestId] = useState<string>();
  const [testDone, toggleTestDone] = useBoolean(false);
  const [pullRequestId, setPullRequestId] = useState('');

  const [, test] = useAsyncFn(
    async (connectionId = null) => {
      resetRunData();
      toggleTestDone.off();
      let startTestResult;
      if (connection) {
        startTestResult = await API.connections.test(
          connectionType,
          connection,
        );
      } else {
        startTestResult = await getTestingConnectionOperationId({
          connectionId,
        });
      }

      setTestId(getId(startTestResult));
      setTestResult(startTestResult);
      return startTestResult;
    },
    [toggleTestDone, connection, connectionType, testId],
  );

  const resetRunData = useCallback(() => {
    setTestResult(null);
  }, [setTestResult]);

  const [, cancel] = useAsyncFn(async () => {
    resetRunData();
    await cancelTest(testId);
  }, [resetRunData, cancelTest, testId]);

  const isLoading = ['R', 'W'].includes(testResult?.request_status);

  useInterval(
    async () => {
      try {
        const result = await API.connections.pullTestConnection(testId);
        setTestResult(result);
        const id = getId(result);
        if (id) {
          setPullRequestId(id);
        }
        if (isTestComplete(result)) {
          toggleTestDone.on();
        }
      } catch (error) {
        throw error;
      }
    },
    ['R', 'W'].includes(testResult?.request_status) ? POLL_INTERVAL : null,
  );
  return {
    pullRequestId,
    test,
    cancel,
    isLoading,
    done: testDone,
    result: (testResult as PullTestConnectionResult)?.error_msg,
    resultsList: (testResult as PullTestConnectionResult)?.results_list,
    status: (testResult as PullTestConnectionResult)?.request_status,
  };
}
// UTILS
const isTestComplete = (result: PullTestConnectionResult) =>
  ['E', 'D'].includes(result.request_status);
// typeof result.results === 'boolean' || result.error_msg?.length;
