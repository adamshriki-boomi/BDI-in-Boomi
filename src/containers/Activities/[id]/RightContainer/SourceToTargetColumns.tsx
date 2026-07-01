import { StatusTypes } from 'api/types';
import {
  Flex,
  HStack,
  Icon,
  InfoTooltip,
  RiveryOverlay,
  Text,
} from 'components';
import { DateDisplay, DurationDisplay } from 'components/DateDisplay';
import HelpMeFixIt from 'components/FixItLink';
import {
  InlineLogStatus,
  LogStatus,
} from 'components/RiveryTableCells/LogStatus';
import {
  CancelRunButton,
  displayCancelButton,
} from 'containers/Activities/[id]/components/CancelRunButton';
import * as React from 'react';
import { Column } from 'react-table';
import { getTimeZone } from 'utils/date.utils';
import { RPUDisplay } from '../../components/RPUDisplay';
import { ErrorLogOverlay } from './ErrorLogOverlay';

const commonStyle = {
  headerProps: { px: 3, py: 2 },
  styleProps: { px: 3, cursor: 'pointer' },
};

const commonColumns = [
  {
    Header: 'Duration',
    id: 'duration',
    Cell: TableDuration,
    weight: 'minmax(150px, 200px)',
    ...commonStyle,
  },
  {
    Header: 'BDU',
    accessor: 'units',
    Cell: RPUDisplay,
    weight: 'min-content',
    sortBy: 'units',
    styleProps: { whiteSpace: 'nowrap' },
    ...commonStyle,
  },
  {
    Header: 'Warning/Error',
    accessor: 'error_description',
    Cell: ErrorLogOverlay,
    weight: 'minmax(200px, 1fr)',
    ...commonStyle,
  },
  {
    Header: '',
    id: 'fix-it',
    Cell: ({ row, column }) => (
      <HelpMeFixIt
        errorMessage={row.original.error_description}
        status={row.original.status}
        onAiClick={docsUrl =>
          column.getProps?.onAiClick?.(row.original, docsUrl)
        }
      />
    ),
    weight: 'min-content',
    ...commonStyle,
  },
  {
    Header: '',
    accessor: 'retry_cancel',
    Cell: ({ row }) => (
      <>
        {/* {displayRetryButton(row?.values) ? (
          <RetryButton _id={row.original.run_id} ariaLabel="retry table" />
        ) : null} */}
        {displayCancelButton(row.original) ? (
          <CancelRunButton run_id={row.original.run_id} />
        ) : null}
      </>
    ),
    weight: '100px',
    ...commonStyle,
  },
];

export const runColumns: Column[] = [
  {
    Header: 'Status',
    accessor: 'status',
    Cell: LogStatus,
    weight: 'min-content',
    ...commonStyle,
  },
  {
    Header: 'Table',
    accessor: 'target_name',
    Cell: TargetName,
    weight: 'minmax(250px, 1fr)',
    sortBy: 'table_name',
    styleProps: { whiteSpace: 'nowrap' },
    ...commonStyle,
  },
  ...commonColumns,
];

function RunsHeader() {
  return (
    <RiveryOverlay
      placement="auto"
      description={`(UTC ${getTimeZone()})`}
      contentProps={{ maxW: '500px' }}
    >
      <HStack>
        <Text>Runs</Text>
        <Icon as={InfoTooltip} boxSize="12px" color="font-secondary" />
      </HStack>
    </RiveryOverlay>
  );
}

export const tableColumns: Column[] = [
  {
    Header: <RunsHeader />,
    accessor: 'start_date_in_milliseconds',
    Cell: ({ value, row }) => {
      return (
        <Flex gap={4}>
          <InlineLogStatus value={row.original.status} />
          {value ? (
            <DateDisplay value={value} />
          ) : (
            <Text color="font-secondary">
              Unable to retrieve Run Information
            </Text>
          )}
        </Flex>
      );
    },
    weight: 'minmax(200px, 1fr)',
    sortBy: 'start_time',
    styleProps: { whiteSpace: 'nowrap' },
    ...commonStyle,
  },
  ...commonColumns,
];

function TableDuration({
  row: {
    original: { end_date_in_milliseconds, start_date_in_milliseconds, status },
  },
}) {
  const date = new Date();
  const endTime = end_date_in_milliseconds
    ? end_date_in_milliseconds
    : [StatusTypes.RUNNING, StatusTypes.PENDING].includes(status)
    ? date.getTime()
    : null;
  return endTime ? (
    <DurationDisplay ms={endTime - start_date_in_milliseconds} />
  ) : (
    '--:--'
  );
}

function TargetName({ value, row }) {
  const status = row?.original?.status;
  const isRunFinished = [
    StatusTypes.FAILED,
    StatusTypes.SUCCEEDED,
    StatusTypes.SKIPPED,
  ].includes(status);
  return value ? (
    <RiveryOverlay
      placement="auto"
      description={value}
      contentProps={{ maxW: '500px' }}
    >
      <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
        {value}
      </Text>
    </RiveryOverlay>
  ) : isRunFinished ? (
    <Text>Unable to retrieve Table Name</Text>
  ) : (
    <Text>Pending...</Text>
  );
}
