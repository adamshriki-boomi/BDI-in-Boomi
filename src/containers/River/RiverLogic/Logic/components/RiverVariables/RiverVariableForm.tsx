import { RiveryModal } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Input } from 'components/Form';
import { Tagger } from 'components/Tracking/Tagger';
import { useFocusFirstField } from 'hooks/useFocusFirstField';
import { useToastComponent } from 'hooks/useToast';
import { IDataframe } from 'modules/DataFrames/store/dataframes.types';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  alphaNumericValidation,
  validateReservedVariableName,
} from 'utils/validations';

type RiverVariableFormProps = {
  variables: any;
  variable?: any;
  onDone: () => any;
  onSubmit?: (data: any) => any;
};
export function RiverVariableForm({
  variables,
  variable,
  onDone,
  onSubmit,
}: RiverVariableFormProps) {
  const isDataFrameNameInvalid = useRiverVariableValidator(variables);
  const { error } = useToastComponent();
  const { handleSubmit, ...useFormApi } = useForm({
    defaultValues: { name: '' },
    mode: 'onChange',
  });
  const {
    formState: { isValid, isDirty },
  } = useFormApi;
  const onFormSubmit = async (formData: Partial<IDataframe>) => {
    const response = onSubmit && (await onSubmit({ ...variable, ...formData }));
    const hasError = Boolean(response?.error);
    if (hasError) {
      error({ description: response.error.data });
      return;
    }
    onDone();
  };

  useFocusFirstField(useFormApi, 'name');
  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <RiveryModal.Body>
        <Input
          label="Variable Name"
          placeholder="Enter name..."
          name="name"
          chakra
          api={useFormApi}
          required
          validate={name => {
            const reservedError = validateReservedVariableName(name);
            if (reservedError) {
              return reservedError;
            }
            const validationResult = isDataFrameNameInvalid(name);
            const messages = {
              nameExists: 'Variable exists already',
              containsInvalidChars:
                'Variable name must contain only letters, digits or underscores and begin with a letter',
            };
            return validationResult ? messages[validationResult] : true;
          }}
        />
      </RiveryModal.Body>
      <RiveryModal.Footer>
        <Tagger tags="modal-cancel">
          <RiveryButton
            variant="default"
            label="Cancel"
            onClick={() => onDone()}
          />
        </Tagger>
        <RiveryButton
          type="submit"
          variant="primary"
          label="Add"
          aria-label="Add"
          disabled={!isValid || !isDirty}
        />
      </RiveryModal.Footer>
    </form>
  );
}

export const useRiverVariableValidator = variables => {
  return useCallback(
    (name: string) => {
      const reservedError = validateReservedVariableName(name);
      if (reservedError) {
        return 'isReserved';
      }
      const errors = [
        {
          code: 'nameExists',
          invalid: Boolean(variables?.[name]),
        },
        {
          code: 'containsInvalidChars',
          invalid: !Boolean(name?.match(alphaNumericValidation)),
        },
      ];
      const error = errors.find(subject => Boolean(subject.invalid));
      return error ? error.code : false;
    },
    [variables],
  );
};
