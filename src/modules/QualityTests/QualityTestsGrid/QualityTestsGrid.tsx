import { Flex, RiveryModal } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import * as React from 'react';
import { useTestsApi } from '../store/useTestsApi';
import { TestsGrid } from './TestsGrid';

type QualityTestsGridProps = {
  id: string;
  stepId: string;
  type: any;
  skip?: boolean;
  ariaLabel: string;
  onDone: () => any;
};

export function QualityTestsGrid({
  id,
  stepId,
  type,
  skip,
  ariaLabel,
  onDone,
}: QualityTestsGridProps) {
  const { tests, handlers, isLoading } = useTestsApi({
    id,
    type,
    options: { skip },
  });

  return (
    <Flex flexDir="column" overflow="hidden">
      <RiveryModal.Body paddingBlock="0">
        <TestsGrid
          data={tests}
          type={TestsGrid.TestTableType.STEP}
          target={ariaLabel}
          handlers={handlers}
          loading={isLoading}
          stepId={stepId}
        />
      </RiveryModal.Body>
      <RiveryModal.Footer>
        <RiveryButton
          variant="primary"
          label="Done"
          aria-label="done"
          onClick={onDone}
        />
      </RiveryModal.Footer>
    </Flex>
  );
}
