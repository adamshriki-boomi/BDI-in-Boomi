import { DuplicateIcon } from 'components';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import {
  QualityTestWithTypeMetadata,
  TestsApiHandlers,
  useCreateTest,
  useDeleteQualityTestMutation,
} from 'modules';
import { useMemo } from 'react';
import { useToggle } from 'react-use';
import { getRefId } from 'utils/api.sanitizer';
import { QualityTestFormModal } from '../QualityTestForm';

type TestsGridActionsProps = {
  column: {
    getProps: {
      handlers: TestsApiHandlers;
      enableDuplicate: boolean;
      stepId: string;
    };
  };
  row: { original: { _id: string; test_name: string } };
};
export function TestsGridActions({
  row,
  column: { getProps },
}: TestsGridActionsProps) {
  const test = row.original as QualityTestWithTypeMetadata;
  const testId = getRefId(test);
  const [deleteTest] = useDeleteQualityTestMutation();
  const { addTest } = useCreateTest();
  const [showEditModal, toggleEditModal] = useToggle(false);

  const enableDuplicate = getProps.enableDuplicate;
  const onAdd = getProps.handlers.addOne;
  const onRemove = getProps.handlers.removeOne;
  const actions = useMemo(
    () =>
      [
        {
          ...RiveryDropdown.EditMenuItem,
          onClick: () => toggleEditModal(true),
        },
        enableDuplicate && {
          value: 'Duplicate',
          icon: <DuplicateIcon />,
          onClick: () => {
            const {
              _id,
              description,
              updated_at,
              test_name,
              ...duplicatedTest
            } = test;
            addTest({ ...duplicatedTest, test_name: `${test_name} copy` }).then(
              onAdd,
            );
          },
        },
        {
          ...RiveryDropdown.DeleteMenuItem,
          onClick: () => deleteTest(testId).then(() => onRemove(testId)),
        },
      ].filter(Boolean),
    [
      enableDuplicate,
      toggleEditModal,
      test,
      addTest,
      onAdd,
      deleteTest,
      testId,
      onRemove,
    ],
  );

  return (
    <>
      <RiveryDropdown isLazy menuItems={actions} id="tests grid actions" />
      {showEditModal ? (
        <EditTest
          show={showEditModal}
          toggle={toggleEditModal}
          test={test}
          stepId={getProps.stepId}
        />
      ) : null}
    </>
  );
}

const EditTest = ({ test, stepId, show, toggle }) => {
  return (
    <QualityTestFormModal
      test={test}
      toggle={toggle}
      actionType={QualityTestFormModal.ActionType.EDIT}
      stepId={stepId}
      show={show}
    />
  );
};
