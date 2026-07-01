import { Text } from '@chakra-ui/react';
import { GridBox, RiveryTable } from 'components';
import { ResultsPanelInnerSpinner } from 'components/Loaders/Loader';
import { useMemo, useState } from 'react';
import { Column, useSortBy } from 'react-table';
import { useToggle } from 'react-use';
import { QualityTestFormModal } from '../QualityTestForm';
import { useTestTypesMap } from '../store';
import { IQualityTestLog } from '../store/qualityTestsLog.types';
import { QualityTestLog } from './QualityTestLog';
import {
  TestName,
  TestResultsTime,
  TestStatus,
  useFindTest,
} from './TestsLogCells';

interface ResultsGridProps {
  data: IQualityTestLog[];
  loading: boolean;
}
export function ResultsGrid({ data = [], loading }: ResultsGridProps) {
  const [selectedRow, setSelectedRow] = useState<IQualityTestLog | null>(null);
  const [showEditModal, toggleEditModal] = useToggle(false);
  const hasSelectedRowData = Boolean(selectedRow);
  const selectedRowTestId = selectedRow?.data_quality_test_id;

  const rowHandlers = useMemo(
    () => ({
      onRowClick: setSelectedRow,
      isRowSelected: ({ data_quality_test_id }) =>
        selectedRowTestId === data_quality_test_id,
    }),
    [selectedRowTestId],
  );

  return (
    <>
      <RiveryTable
        entityType="Test Logs"
        ariaLabel="tests log"
        loader={loading ? <ResultsPanelInnerSpinner /> : null}
        inline
        noPagination={true}
        columns={columns}
        data={data}
        useSortBy={useSortBy}
        noRecords={NoTests}
        rowHandlers={rowHandlers}
      />
      {hasSelectedRowData ? (
        <TestFormModal
          testId={selectedRow?.data_quality_test_id}
          stepId={selectedRow?.step_id}
          stepName={selectedRow?.step_name}
          onToggle={toggleEditModal}
          show={showEditModal}
        />
      ) : null}
      {hasSelectedRowData && !showEditModal ? (
        <QualityTestLog
          row={selectedRow}
          setSelectedRow={setSelectedRow}
          toggleEditModal={toggleEditModal}
        />
      ) : null}
    </>
  );
}
type TestFormModalProps = {
  testId: string;
  stepId: string;
  stepName: string;
  show: boolean;
  onToggle: () => void;
};
const TestFormModal = ({
  testId,
  stepId,
  stepName,
  onToggle,
  ...rest
}: TestFormModalProps) => {
  const test = useFindTest(testId, stepId);
  return (
    <QualityTestFormModal
      test={test}
      stepId={stepId}
      toggle={onToggle}
      actionType={QualityTestFormModal.ActionType.EDIT}
      {...rest}
    />
  );
};
const NoTests = () => (
  <GridBox alignContent="center" justifyContent="center">
    No tests yet
  </GridBox>
);

const commonStyle = {
  headerProps: { px: 3 },
  styleProps: { px: 3 },
};

const columns: Column[] = [
  {
    Header: 'Time',
    accessor: 'test_run_time',
    Cell: TestResultsTime,
    sortBy: 'test_run_time',
    ...commonStyle,
  },
  {
    Header: 'Test Name',
    accessor: 'test_name',
    Cell: TestName,
    sortBy: 'test_name',
    ...commonStyle,
  },
  {
    Header: 'Status',
    Cell: TestStatus,
    accessor: 'status',
    sortBy: 'status',
    ...commonStyle,
  },

  {
    Header: 'Type',
    Cell: TestType,
    accessor: 'data_quality_test_type_id',
    weight: 'min-content',
    sortBy: 'data_quality_test_type_id',
    ...commonStyle,
  },
  {
    Header: 'Step Name',
    accessor: 'step_name',
    headerProps: { px: 3 },
    styleProps: { pl: 3 },
    sortBy: 'step_name',
  },
];

function TestType({ value }) {
  const testTypesMap = useTestTypesMap();
  const testTypeName = testTypesMap?.get(value);

  return <Text>{testTypeName?.test_type_name ?? null}</Text>;
}
