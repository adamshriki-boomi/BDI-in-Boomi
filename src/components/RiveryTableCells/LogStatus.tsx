import { StatusTypes } from 'api/types';
import {
  Box,
  Center,
  ExclamationCircle,
  HStack,
  Icon,
  OutlinedClose,
  OutlinedSuccess,
  RiveryInfoTooltip,
  StatusIsRunning,
  Text,
} from 'components';
import HelpMeFixIt from 'components/FixItLink';
import { RdsSkipped } from 'components/Icons/components';
import { spinAnimation } from 'containers/River/RiverLogic/Logic/components/ScriptEditor/EditorLayout';
import { ReactNode } from 'react';
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi';

export enum StepLogStatus {
  DONE = 'Done',
  ERROR = 'Error',
}

export const textColors = {
  [StepLogStatus.DONE]: 'green.100',
  [StepLogStatus.ERROR]: 'error',
  [StatusTypes.SUCCEEDED]: 'green.100',
  [StatusTypes.FAILED]: 'error',
  [StatusTypes.RUNNING]: 'primary',
  [StatusTypes.PENDING]: 'textSecondary',
  [StatusTypes.PARTIAL]: 'yellow.200',
};
export const logsStatusMap: Record<string, { icon: ReactNode; title: string }> =
  {
    Done: {
      icon: <Icon as={OutlinedSuccess} boxSize={5} color="green.100" />,
      title: 'Success',
    },
    [StatusTypes.SUCCEEDED]: {
      icon: <Icon as={OutlinedSuccess} boxSize={5} color="green.100" />,
      title: 'Success',
    },
    Error: {
      icon: (
        <Icon as={OutlinedClose} boxSize={5} color="background-danger-strong" />
      ),
      title: 'Error',
    },
    [StatusTypes.FAILED]: {
      icon: (
        <Icon as={OutlinedClose} boxSize={5} color="background-danger-strong" />
      ),
      title: 'Error',
    },
    Running: {
      icon: (
        <Icon
          as={StatusIsRunning}
          boxSize={5}
          color="background-deselected"
          animation={`${spinAnimation} 2s linear infinite`}
        />
      ),
      title: 'Running',
    },
    [StatusTypes.RUNNING]: {
      icon: (
        <Icon
          as={StatusIsRunning}
          boxSize={5}
          color="background-deselected"
          animation={`${spinAnimation} 2s linear infinite`}
        />
      ),
      title: 'Running',
    },
    [StatusTypes.PENDING]: {
      icon: (
        <Icon
          as={HiOutlineDotsCircleHorizontal}
          boxSize={5}
          color="icon-secondary"
        />
      ),
      title: 'Pending',
    },
    [StatusTypes.PARTIAL]: {
      icon: <Icon as={ExclamationCircle} boxSize={5} color="yellow.500" />,
      title: 'Partially Succeeded',
    },
    [StatusTypes.SKIPPED]: {
      icon: <Icon as={RdsSkipped} boxSize={5} color="tagOrange" />,
      title: 'Skipped',
    },
  };

export function StatusIcon({ value }) {
  return <>{logsStatusMap?.[value]?.icon}</>;
}

export function LogStatus({ value }) {
  return <Center w="100%">{logsStatusMap?.[value]?.icon}</Center>;
}

export function StatusWithTooltip({ value }) {
  return (
    <RiveryInfoTooltip
      buttonProps={{
        minW: '0px important',
      }}
      description={<Text textTransform="capitalize">{value}</Text>}
      icon={<StatusIcon value={value} />}
    />
  );
}

export function InlineLogStatus({ value }) {
  return <Box>{logsStatusMap?.[value]?.icon}</Box>;
}

export function LogStatusText({
  value,
  errorMessage,
  onAiClick,
}: {
  value: any;
  errorMessage: any;
  onAiClick?: (docsUrl?: string | null) => void;
}) {
  return (
    <HStack justify="space-between">
      <Text color={textColors?.[value]} textTransform="capitalize">
        {value}
      </Text>
      <HelpMeFixIt
        errorMessage={errorMessage}
        status={value}
        onAiClick={onAiClick}
      />
    </HStack>
  );
}

export function LogStatusIconAndText({ value }) {
  return (
    <HStack>
      <StatusIcon value={value} />
      <Text textTransform="capitalize">{value}</Text>
    </HStack>
  );
}
