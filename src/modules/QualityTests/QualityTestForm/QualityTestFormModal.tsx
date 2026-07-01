import { RiveryModal, RiveryModalProps } from 'components';
import { IQualityTest } from '../store/qualityTests.types';
import {
  ActionType,
  QualityTestForm,
  QualityTestFormProps,
} from './QualityTestForm';

export interface QualityTestModalProps
  extends Pick<QualityTestFormProps, 'onSubmit' | 'actionType'>,
    RiveryModalProps {
  stepId: string;
  test?: Partial<IQualityTest>;
}
QualityTestFormModal.ActionType = ActionType;

export function QualityTestFormModal({
  actionType,
  stepId,
  toggle,
  onSubmit,
  test,
  ...rest
}: QualityTestModalProps) {
  return (
    <RiveryModal title={`${actionType} Quality Test`} toggle={toggle} {...rest}>
      <QualityTestForm
        actionType={actionType}
        toggleModal={toggle}
        onSubmit={onSubmit}
        stepId={stepId}
        test={test}
      />
    </RiveryModal>
  );
}
