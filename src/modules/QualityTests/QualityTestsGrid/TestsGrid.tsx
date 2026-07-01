import { ButtonCreate, GridBox, HStack, RiveryTable, Text } from 'components';
import { RiverySwitch } from 'components/Form/components';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { TableLocaleDateTime } from 'components/RiveryTable/TableLocaleDateTime';
import { TestsApiHandlers } from 'modules';
import { useMemo } from 'react';
import { Column, useSortBy } from 'react-table';
import { useToggle } from 'react-use';
import { compare } from 'utils/array.utils';
import { QualityTestFormModal } from '../QualityTestForm';
import { IQualityTest } from '../store/qualityTests.types';
import { TestsGridActions } from './TestsGridActions';

export enum TestTableType {
  RIVER = 'river',
  STEP = 'step',
}
interface TestsGridProps {
  type: TestTableType;
  target: string;
  data: IQualityTest[];
  loading: boolean;
  stepId: string;
  handlers: TestsApiHandlers;
}
TestsGrid.TestTableType = TestTableType;
export function TestsGrid({
  type,
  target,
  data,
  loading,
  stepId,
  handlers,
}: TestsGridProps) {
  const columns = useMemo(
    () =>
      TableColumns[type]?.map(column => ({
        ...column,
        getProps: {
          stepId,
          enableDuplicate: type === TestTableType.STEP,
          handlers,
        },
      })),
    [type, stepId, handlers],
  );
  return (
    <>
      <RiveryTable
        ariaLabel="quality tests for step"
        title={target}
        loader={loading ? <PageOverlaySpinner /> : null}
        entityType="Quality Tests"
        columns={columns}
        data={data}
        useSortBy={useSortBy}
        paginationConfig={paginationConfig}
        extraControls={
          <AddQualityTestButton stepId={stepId} onAdd={handlers.addOne} />
        }
        noRecords={NoTests}
      />
    </>
  );
}

const AddQualityTestButton = ({ stepId, onAdd }) => {
  const [showAddTest, toggleAddTest] = useToggle(false);
  return (
    <HStack flexGrow={1} justifyContent="flex-start" ml={2}>
      <ButtonCreate
        aria-label="Add quality test"
        px={1}
        onClick={() => toggleAddTest(true)}
      >
        Quality Test
      </ButtonCreate>
      <QualityTestFormModal
        actionType={QualityTestFormModal.ActionType.ADD}
        toggle={toggleAddTest}
        show={showAddTest}
        onSubmit={onAdd}
        stepId={stepId}
      />
    </HStack>
  );
};

const NoTests = () => (
  <GridBox alignContent="center" justifyContent="center">
    No tests yet
  </GridBox>
);
const paginationConfig = {
  autoResetPage: false,
  autoResetGlobalFilter: false,
  initialState: { pageSize: 20 },
};

const headerProps = {
  px: 3,
  borderRight: '1px solid',
  borderColor: 'gray.200',
};
const stepColumns: Column[] = [
  // placeholder for drag and drop
  // {
  //   Header: '',
  //   accessor: 'index',
  //   Cell: () => <MdOutlineDragIndicator size={24} />,
  //   weight: 'min-content',
  // },
  {
    Header: 'Test Name',
    accessor: 'test_name',
    headerProps,
  },
  {
    Header: 'Test Type',
    accessor: 'test_type_name',
    headerProps,
    weight: 'min-content',
  },
  {
    Header: 'Test Description',
    accessor: 'description',
    Cell: TextEllipsis,
    styleProps: { overflow: 'hidden' },
    headerProps,
    weight: 'auto',
  },
  {
    Header: 'Last Modified',
    Cell: TableLocaleDateTime,
    accessor: 'updated_at',
    headerProps,
  },
  {
    Header: AllTestsSwitch,
    Cell: SingleTestSwitch,
    accessor: 'is_active',
    headerProps,
    weight: 'min-content',
  },
  {
    Header: '',
    id: 'table-actions',
    weight: 'min-content',
    styleProps: { justifyContent: 'center' },
    Cell: TestsGridActions,
  },
];

const riverColumns: Column[] = [
  // disabled until DEV-2403
  // {
  //   Header: 'Step Name',
  //   accessor: 'step_name',
  // },
  // {
  //   Header: 'Priority',
  //   accessor: 'priority',
  // },
];

const TableColumns = {
  [TestTableType.STEP]: stepColumns,
  [TestTableType.RIVER]: [...riverColumns, ...stepColumns],
};

type AllTestsSwitchProps = {
  column: { id: string; getProps: { handlers: TestsApiHandlers } };
  data: IQualityTest[];
};
function AllTestsSwitch({
  column: { id, getProps },
  data,
}: AllTestsSwitchProps) {
  const isActive = data?.some(compare('is_active', true));

  return (
    <RiverySwitch
      label=""
      ariaLabel={`toggle all tests`}
      name={`test-toggle-all-${id}`}
      isChecked={isActive}
      onChange={() => getProps.handlers.toggleAll(!isActive)}
    />
  );
}

type SingleTestSwitchProps = {
  column: { id: string; getProps: { handlers: TestsApiHandlers } };
  row: { original: { _id: string; test_name: string } };
  value: boolean;
};
function SingleTestSwitch({
  value,
  row: {
    original: { _id, test_name },
  },
  column: { getProps },
}: SingleTestSwitchProps) {
  return (
    <RiverySwitch
      label=""
      ariaLabel={test_name}
      name={`test-toggle-${_id}`}
      isChecked={value}
      onChange={() => getProps.handlers.toggleOne(_id, !Boolean(value))}
    />
  );
}

function TextEllipsis({ value }) {
  return (
    <Text noOfLines={1} whiteSpace="nowrap" title={value}>
      {value}
    </Text>
  );
}
