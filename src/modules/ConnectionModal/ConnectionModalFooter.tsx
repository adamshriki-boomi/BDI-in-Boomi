import { IConnection, RunStatus } from 'api/types';
import { Box, HStack } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { ViewLogs } from 'components/ViewLogs/ViewLogs';
import { FeatureEnabler } from 'modules';
import { ConnectionTester } from 'modules/SourceTarget/components/ConnectionSetup/ConnectionTester';
import { FailStatus, SuccessStatus } from 'modules/Status';
import { useAccount } from 'store/core';
import { useTestConnection } from './useTestConnection';

type ConnectionModalFooterProps = {
  connectionType: string;
  connection: IConnection;
  onCancel: () => any;
  showTestConnection: boolean;
  isSaving: boolean;
  form?: any;
};

export function ConnectionModalFooter({
  showTestConnection,
  connectionType,
  connection,
  onCancel,
  isSaving = false,
}: ConnectionModalFooterProps) {
  const {
    test,
    isLoading,
    cancel,
    result,
    pullRequestId,
    done,
    resultsList,
    status,
  } = useTestConnection(connectionType, connection);
  const { isMemberRole } = useAccount();
  return (
    <Box maxW="630px" mx="auto" w="full" alignSelf="end">
      <HStack my={0} w="100%">
        {showTestConnection && (
          <ConnectionTester
            test={test}
            isTesting={isLoading}
            cancel={cancel}
            resultsList={resultsList}
            status={status}
            variant="connection"
            showDetails={connection?.is_test_connection_list}
          />
        )}
        <HStack flex={1} justifyContent="flex-end" gap={1} ml="auto">
          {onCancel ? (
            <RiveryButton label="Cancel" variant="default" onClick={onCancel} />
          ) : null}
          <FeatureEnabler>
            <RiveryButton
              isLoading={isSaving}
              label="Save"
              variant="primary"
              type="submit"
              isDisabled={isMemberRole}
            />
          </FeatureEnabler>
        </HStack>
      </HStack>
      {done ? (
        <Box pt={3} mt={0}>
          {status === RunStatus.ERROR ? (
            <FailStatus
              text={
                <>
                  Error: {result}
                  <ViewLogs pullRequestId={pullRequestId} />
                </>
              }
            />
          ) : (
            status === RunStatus.DONE && (
              <SuccessStatus text="Test Connection Passed!" />
            )
          )}
        </Box>
      ) : null}
    </Box>
  );
}
