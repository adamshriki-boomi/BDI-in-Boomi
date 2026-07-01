import { RunStatus, TestResult } from 'api/types';
import {
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Flex,
  HStack,
  Icon,
  LightningBoltContained,
  RenderGuard,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import { StatusReflection } from 'containers/River/RiverSourceToTarget/components/RiverActivation/components/StatusReflection';
import {
  ContainedFailStatus,
  ContainedRunningStatus,
  ContainedSuccessStatus,
} from 'modules/Status';

interface TestResultsProps {
  resultsList: TestResult[];
  status: RunStatus;
  toggle: () => void;
}

const StatusMap = {
  W: { component: ContainedRunningStatus, text: 'Testing Connection' },
  R: { component: ContainedRunningStatus, text: 'Testing Connection' },
  E: {
    component: ContainedFailStatus,
    text: 'Test Connection Failed. Check Connection settings.',
  },
  D: {
    component: ContainedSuccessStatus,
    text: 'Connection Tested Successfully.',
  },
};

const ConnectionTestIndicator = ({ status, variant, children }) => {
  const Component = StatusMap?.[status]?.component ?? ContainedRunningStatus;
  const description = StatusMap?.[status]?.text ?? 'Testing connection';
  return (
    <HStack justify="space-between">
      <RenderGuard condition={variant === 'river'}>
        <Component text={description} sx={{ '& span': { color: 'font' } }} />
      </RenderGuard>
      {children}
    </HStack>
  );
};

TestResults.ConnectionTestIndicator = ConnectionTestIndicator;
export function TestResults({ resultsList, status, toggle }: TestResultsProps) {
  return (
    <DrawerContent>
      <DrawerHeader py={2} borderBottom="1px solid" borderColor="gray.300">
        <HStack>
          <Icon as={LightningBoltContained} boxSize={5} />
          <Text textStyle="M4">Test Connection</Text>
        </HStack>
      </DrawerHeader>
      <DrawerBody>
        <Flex flexDir="column" gap={3} pt={3}>
          <StatusReflection
            isMain
            description="Testing Connection"
            status={status}
          />
          {resultsList?.map(
            ({ error_msg, test_description, test_label, test_status }) => {
              const step_status = calculateStepStatus(test_status, status);
              return (
                <RenderGuard condition={test_status !== 'S'}>
                  <Flex flexDir="column" gap={2} pl={6}>
                    <Flex flexDir="column">
                      <StatusReflection
                        description={test_label}
                        status={step_status}
                      />
                      <Text textStyle="R8" color="font-secondary" pl="28px">
                        {test_description}
                      </Text>
                    </Flex>
                    <RenderGuard
                      condition={error_msg && test_status === RunStatus.ERROR}
                    >
                      <RiveryAlert
                        variant="error-light"
                        description={error_msg}
                      />
                    </RenderGuard>
                  </Flex>
                </RenderGuard>
              );
            },
          )}
        </Flex>
      </DrawerBody>
      <RiveryDrawerFooter
        footerHeight="57px"
        handleOnSuccess={console.log}
        handleOnClose={toggle}
        saveLabel={null}
        cancelLabel="Close"
      />
    </DrawerContent>
  );
}

function calculateStepStatus(stepStatus, mainStatus) {
  if (mainStatus === RunStatus.ERROR && stepStatus !== RunStatus.ERROR) {
    return RunStatus.WAITING;
  }
  return stepStatus;
}
