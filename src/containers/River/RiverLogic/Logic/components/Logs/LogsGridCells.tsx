import { IconButtonProps } from '@chakra-ui/react';
import { BlockTypes } from 'api/types';
import {
  Box,
  CloseIcon,
  Flex,
  GridBox,
  HStack,
  Icon,
  IconButton,
  LogStatusText,
  RenderGuard,
  StepIcon,
  Text,
} from 'components';
import { WideRow } from 'components/Drawer/DrawerStatusRow';
import { DownloadPythonStepLog } from 'containers/Activities/[id]/components/DownloadLogButton';
import { RUN_ID_PARAM } from 'containers/Activities/[id]/params';
import { ReactElement, useMemo } from 'react';
import { useSearchParam } from 'react-use';
import { useCore } from 'store/core';
import { displayDate, durationFormat } from 'utils/date.utils';
import { isFailureStatus } from 'utils/status.utils';
import { EnableAiPrompt } from 'containers/Activities/[id]/components/AiFix.drawer';

export function LogsTime({ value, ...props }) {
  return (
    <Box {...props}>
      {value ? displayDate(value, 'dd-MMM-yy, HH:mm:ss') : 'N/A'}
    </Box>
  );
}

export function StepName({
  value,
  row: {
    original: {
      block_type,
      code_type = 'python',
      container,
      is_container,
      container_type,
      nested,
      expanded,
      step_index,
    },
  },
}) {
  const isLogicode = block_type === BlockTypes.LOGICODE;
  const isActionOrRiver =
    block_type === BlockTypes.ACTION || block_type === BlockTypes.RIVER;
  const nestingDepth = step_index.split('.');

  const marginBuffer = useMemo(() => {
    if (expanded && nested && nestingDepth.length === 3) {
      return 6;
    } else if (expanded && nested) {
      return 12;
    }
    return 0;
  }, [expanded, nested, nestingDepth]);

  return (
    <HStack ml={marginBuffer} gap={1}>
      <StepIcon
        boxSize={4}
        icon={
          isLogicode
            ? code_type
            : container || is_container
            ? container_type
            : isActionOrRiver
            ? block_type
            : 'sql'
        }
      />
      <Text _hover={{ textDecoration: 'underline' }} cursor="pointer">
        {value}
      </Text>
    </HStack>
  );
}

export function StepDuration({ value }) {
  if (value && value !== 'None') {
    const runDuration = value.split(':').map(string => string.substring(0, 2));
    return durationFormat(runDuration);
  }
  return 'N/A';
}

export function LogActionButton({
  iconType,
  ...props
}: IconButtonProps & { iconType: ReactElement }) {
  return (
    <IconButton
      display="flex"
      justifyContent="end"
      variant="text-link"
      icon={iconType}
      ml="auto"
      p={0}
      {...props}
    />
  );
}

export function StepLog({ row, setSelectedRow, runId = null, onAiClick }) {
  const { envId, selectedAccountId } = useCore();
  const run = useSearchParam(RUN_ID_PARAM);

  if (!row) {
    return null;
  }
  const {
    step_name,
    account,
    step_id,
    step_execution_id,
    environment_id,
    start_time,
    end_time,
    step_index,
    container,
    container_type,
    step_duration,
    duration,
    step_status,
    error_description,
    end_date_in_milliseconds,
    start_date_in_milliseconds,
    loop_iteration_number,
    block_type,
  } = row;

  const isLogicode = block_type === BlockTypes.LOGICODE;
  return (
    <Flex direction="column" mx={6} py={4} h="full">
      <HStack
        justifyContent="space-between"
        borderBottom="1px solid"
        borderBottomColor="gray.300"
      >
        <Text fontWeight="bold" fontSize="lg">
          {step_name} Log
        </Text>

        <LogActionButton
          onClick={() => setSelectedRow(null)}
          aria-label="close log"
          iconType={<Icon as={CloseIcon} />}
        />
      </HStack>
      <RenderGuard condition={isFailureStatus(step_status)}>
        <Box mt={4}>
          <EnableAiPrompt />
        </Box>
      </RenderGuard>
      <GridBox py={2} overflow="hidden">
        <Box pb={2}>
          <DownloadPythonStepLog
            show={isLogicode}
            _id={runId ? runId : run}
            step={{
              step_id,
              iteration: loop_iteration_number ? loop_iteration_number : null,
            }}
          />
        </Box>
        <WideRow name="Account ID" value={account ?? selectedAccountId} />
        <WideRow name="Environment ID" value={environment_id ?? envId} />
        <WideRow name="Step ID" value={step_id} />
        <WideRow name="Step Execution ID" value={step_execution_id} breakLine />
        <WideRow
          name={
            <GridBox gap="2">
              <div>Start Time</div>
              <div>End Time</div>
            </GridBox>
          }
          value={
            <GridBox gap="2">
              <LogsTime
                ml="auto"
                mr="0"
                value={start_time ?? start_date_in_milliseconds}
              />
              <LogsTime
                ml="auto"
                mr="0"
                value={end_time ?? end_date_in_milliseconds}
              />
            </GridBox>
          }
        />
        <WideRow name="Step Counter" value={step_index} />
        {container ? <WideRow name="Container" value="True" /> : null}
        {container_type ? (
          <WideRow name="Container Type" value={container_type} />
        ) : null}
        <WideRow
          name="Loop Iteration Number"
          value={row.loop_iteration_number}
        />
        <WideRow
          name="Step Duration"
          value={StepDuration({ value: step_duration ?? duration })}
        />
        <WideRow
          name="Step Status"
          value={
            <LogStatusText
              value={step_status}
              errorMessage={error_description}
              onAiClick={onAiClick}
            />
          }
        />
        {error_description && (
          <WideRow
            name="Error Description"
            value={error_description}
            breakLine
            overflow="auto"
          />
        )}
      </GridBox>
    </Flex>
  );
}
