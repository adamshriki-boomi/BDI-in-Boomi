import { Divider } from '@chakra-ui/react';
import { FormLabel, RiveryModal, Text } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { createOption, FormSelect, Input } from 'components/Form';
import { Tagger } from 'components/Tracking/Tagger';
import {
  IQualityTest,
  useCreateTest,
  useUpdateQualityTestMutation,
} from 'modules';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { compose } from 'redux';
import { useRiver } from 'store/river';
import { getRefId } from 'utils/api.sanitizer';
import { pluck } from 'utils/array.utils';
import { IQualityTestType, useTestTypes } from '../store';
import { TestTypeRenderer } from './TestTypes';

const testTypeOptionParser = {
  getOptionValue: getRefId,
  getOptionLabel: pluck<IQualityTestType, string>('test_type_name'),
};

export enum ParametersSelectType {
  MULTI = 'multi',
  SINGLE = 'single',
}

const addFormInitialState = {
  test_name: '',
  data_quality_test_type_id: '',
  test_schema: [],
};
export enum ActionType {
  ADD = 'Add',
  EDIT = 'Edit',
}
export interface QualityTestFormProps {
  stepId: string;
  actionType: ActionType;
  test?: Partial<IQualityTest>;
  toggleModal?: (nextValue?: any) => void;
  onSubmit?: (id: string) => void;
}
export function QualityTestForm({
  stepId,
  actionType,
  toggleModal,
  onSubmit,
  test = addFormInitialState,
}: QualityTestFormProps) {
  const isEdit = actionType === ActionType.EDIT;
  const { types, findTest } = useTestTypes();
  const { fields } = useStepFields(stepId);
  const { mutateTest, isLoading: isMutatingTest } =
    useTestMutations(actionType);

  const {
    register,
    handleSubmit,
    setError,
    formState: { isValid, isDirty },
    ...useFormApi
  } = useForm<IQualityTest>({
    defaultValues: test,
    mode: 'onChange',
  });
  const onFormSubmit = async (formData: IQualityTest) => {
    const { description, ...data } = formData;
    const testData: any = {
      ...data,
      ...(isEdit ? {} : { description }),
      _id: test?._id,
    };
    const testId = await mutateTest(testData);
    onSubmit && onSubmit(testId);
    toggleModal(false);
  };
  const selectedTestType = useFormApi.watch('data_quality_test_type_id');
  const showTestType = Boolean(selectedTestType);
  const testTypeName = findTest(selectedTestType)?.test_type_name;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <RiveryModal.Body>
        <Input label="Test Name" name="test_name" api={useFormApi} required />
        <FormDivider />
        <Label>Test Type</Label>
        <FormSelect
          aria-label="Test Type"
          name="data_quality_test_type_id"
          options={types}
          selectProps={testTypeOptionParser}
          controlId="test type"
          api={useFormApi}
          required="Test Type is required"
          chakra
        />
        <FormDivider />
        <Label>Parameter(s)</Label>
        {showTestType ? (
          <>
            <TestTypeRenderer
              type={testTypeName}
              api={useFormApi}
              options={fields}
            />
            <input
              type="hidden"
              value={testTypeName}
              {...register('test_type_name')}
            />
          </>
        ) : (
          <Text fontSize="sm" color="gray.600">
            Select 'Quality Test Type' above to set conditions
          </Text>
        )}
      </RiveryModal.Body>
      <RiveryModal.Footer>
        <Tagger tags="modal-cancel">
          <RiveryButton
            variant="outlined-primary"
            label="Cancel"
            onClick={() => toggleModal(false)}
            size="small"
          />
        </Tagger>
        <RiveryButton
          type="submit"
          variant="primary"
          label={isEdit ? 'Done' : ActionType.ADD}
          isLoading={isMutatingTest}
          disabled={!isValid || !isDirty || isMutatingTest}
          size="small"
        />
      </RiveryModal.Footer>
    </form>
  );
}

// components
const FormDivider = () => {
  return <Divider my="4" />;
};

const Label = props => (
  <FormLabel fontSize="sm" fontWeight="medium" {...props} />
);

const createOptionByFieldName = compose(createOption, pluck('fieldName'));
const useStepFields = (stepId: string) => {
  const { findStepById } = useRiver();
  const fields = useMemo(() => {
    return findStepById(stepId)?.content?.fields?.map(createOptionByFieldName);
  }, [findStepById, stepId]);
  return { fields };
};

const useTestMutations = (actionType: ActionType) => {
  const { addTest, result } = useCreateTest();
  const [updateTest, updateResult] = useUpdateQualityTestMutation();

  const action = {
    [ActionType.ADD]: addTest,
    [ActionType.EDIT]: updateTest,
  };

  return {
    mutateTest: action[actionType],
    isLoading: result?.isLoading || updateResult.isLoading,
  };
};
