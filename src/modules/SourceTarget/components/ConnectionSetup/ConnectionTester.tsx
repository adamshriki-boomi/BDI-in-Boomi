import { RunStatus } from 'api/types';
import {
  Box,
  Drawer,
  DrawerOverlay,
  Flex,
  InfoTooltip,
  RenderGuard,
  RiveryButton,
  RiveryButtonProps,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { TestConnection } from 'modules/ConnectionModal/TestConnection';
import { useToggle } from 'react-use';
import { TestResults } from './TestResults';

interface ConnectionTesterProps extends Partial<RiveryButtonProps> {
  test: any;
  isTesting: boolean;
  cancel: any;
  resultsList: any[];
  status: string;
  variant?: 'connection' | 'river';
  showDetails?: boolean;
}

export const ConnectionTester = ({
  test,
  cancel,
  isTesting,
  resultsList,
  status,
  variant = 'river',
  showDetails = false,
  ...props
}: ConnectionTesterProps) => {
  const [showResults, toggleTestConnectionResults] = useToggle(false);
  return (
    <>
      <Wrapper variant={variant}>
        <Flex flexDir="column" gap={2}>
          <RenderGuard condition={variant !== 'connection'}>
            <TestConnectionPrompt />
          </RenderGuard>
          <Box>
            <TestConnection
              loading={isTesting}
              onCancel={cancel}
              onTest={test}
              variant={variant}
            />
          </Box>
        </Flex>
      </Wrapper>

      <RenderGuard condition={Boolean(status)}>
        <TestResults.ConnectionTestIndicator status={status} variant={variant}>
          {Boolean(resultsList?.length) && showDetails ? (
            <RiveryButton
              label="Show details"
              variant="link"
              onClick={toggleTestConnectionResults}
            />
          ) : null}
        </TestResults.ConnectionTestIndicator>
      </RenderGuard>
      <Drawer
        size="default"
        isOpen={showResults}
        onClose={toggleTestConnectionResults}
        aria-label="connection modal"
        placement="right"
        closeOnOverlayClick={false}
      >
        <DrawerOverlay />
        <TestResults
          resultsList={resultsList}
          toggle={toggleTestConnectionResults}
          status={status as RunStatus}
        />
      </Drawer>
    </>
  );
};

const Wrapper = ({ variant, children }) => {
  return variant === 'connection' ? (
    children
  ) : (
    <RiveryAlert variant="info" icon={InfoTooltip} description={children} />
  );
};

const TestConnectionPrompt = () => (
  <Text textStyle="R7">
    Performing a test Connection is recommended to ensure <br /> a valid
    Connection for a successful Data Flow.
  </Text>
);
