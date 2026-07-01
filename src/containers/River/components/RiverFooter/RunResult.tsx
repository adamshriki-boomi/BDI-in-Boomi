import { Flex, Grid, Icon, Spinner, Text } from '@chakra-ui/react';
import { RunStatus, StatusTypes } from 'api/types';
import { RiveryModal } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { IRiverActivityRun } from 'containers/Activities';
import { HiDotsCircleHorizontal } from 'react-icons/hi';
import { IoMdCloseCircle } from 'react-icons/io';
import { MdCheckCircle } from 'react-icons/md';
import { useToggle } from 'react-use';
import { useRiver, useRiverRun } from 'store/river';

const iconBoxSize = 6;
const waitingToRun = {
  icon: (
    <Icon as={HiDotsCircleHorizontal} boxSize={iconBoxSize} color="warning" />
  ),
  statusDescription: 'is waiting to run',
};
const RunStatusVariants = {
  [RunStatus.ERROR]: {
    icon: (
      <Icon
        as={IoMdCloseCircle}
        boxSize={iconBoxSize}
        color="background-danger-strong"
      />
    ),
    statusDescription: 'failed',
  },
  [RunStatus.DONE]: {
    icon: <Icon as={MdCheckCircle} boxSize={iconBoxSize} color="success" />,
    statusDescription: 'completed successfully',
  },
  [RunStatus.RUNNING]: {
    icon: <Spinner mt={0.5} boxSize={4} color="primary" />,
    statusDescription: 'is now running',
  },
  [StatusTypes.FAILED]: {
    icon: (
      <Icon
        as={IoMdCloseCircle}
        boxSize={iconBoxSize}
        color="background-danger-strong"
      />
    ),
    statusDescription: 'failed',
  },
  [StatusTypes.SUCCEEDED]: {
    icon: <Icon as={MdCheckCircle} boxSize={iconBoxSize} color="success" />,
    statusDescription: 'completed successfully',
  },
  [StatusTypes.RUNNING]: {
    icon: <Spinner mt={0.5} boxSize={4} color="primary" />,
    statusDescription: 'is now running',
  },
  [StatusTypes.SKIPPED]: {
    icon: (
      <Icon
        as={IoMdCloseCircle}
        boxSize={iconBoxSize}
        color="background-danger-strong"
      />
    ),
    statusDescription: 'skipped',
  },
  [RunStatus.WAITING]: {
    ...waitingToRun,
  },
  [StatusTypes.PENDING]: {
    ...waitingToRun,
  },
};

export function RunResult() {
  const { selectedRiverName } = useRiver();
  const { details, hasDetails, isWaiting } = useRiverRun();
  const v1Details = details && ({ ...details } as IRiverActivityRun);
  if (!hasDetails && !isWaiting && !v1Details?.status) {
    return null;
  }
  const { icon, statusDescription } = isWaiting
    ? waitingToRun
    : RunStatusVariants?.[details?.river_run_status ?? v1Details?.status];
  const isError =
    details?.river_run_status === RunStatus.ERROR ||
    v1Details?.status === StatusTypes.FAILED;
  return (
    <Flex
      marginTop="2"
      borderTop="1px solid"
      borderColor="gray.200"
      paddingTop="2"
      gridGap={2}
    >
      <StatusDialog
        title={`${details?.river_name ?? selectedRiverName} Error`}
        description={details?.error_message ?? v1Details?.error_description}
        wrap={isError}
      >
        {icon}
        <Text fontWeight="bold">
          {details?.river_name ?? selectedRiverName}
        </Text>
        <Status>
          {statusDescription}
          {isError
            ? `: ${details?.error_message ?? v1Details?.error_description}`
            : '.'}
        </Status>
        {!isWaiting ? (
          <DateTime
            date={
              (details?.run_end_date || details?.run_update_date) ??
              (v1Details?.end_date_in_milliseconds ||
                v1Details?.start_date_in_milliseconds)
            }
          />
        ) : null}
      </StatusDialog>
    </Flex>
  );
}

const Status = props => <Text variant="textEllipsis" {...props} />;
function DateTime({ date }: { date: number }) {
  const dateObj = new Date(date);
  return (
    <Text>
      {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString()}
    </Text>
  );
}

/**
 * @property wrap {boolean} (false) - if true, wraps children with a dialog button behavior,
 * otherwise, children is the return render value
 */
export const StatusDialog = ({
  title,
  description,
  children,
  wrap = false,
}) => {
  const [show, toggle] = useToggle(false);

  const handleOnClose = () => {
    toggle(false);
  };

  const handleOnOpen = () => {
    toggle(true);
  };

  if (!wrap) {
    return children;
  }

  return (
    <>
      <RiveryButton
        onClick={handleOnOpen}
        label={
          <Grid
            gridTemplateColumns="auto 1fr auto auto"
            gridGap="1"
            alignItems="center"
          >
            {children}
          </Grid>
        }
        variant="text-link"
        p={0}
        aria-label="display error details"
      />

      <RiveryModal
        title={title}
        show={show}
        onSuccess={handleOnClose}
        onClose={handleOnClose}
        footer={{
          saveLabel: 'OK',
          cancelLabel: false,
        }}
        body={description}
      />
    </>
  );
};
