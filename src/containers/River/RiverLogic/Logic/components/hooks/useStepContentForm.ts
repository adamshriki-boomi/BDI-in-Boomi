import { Content, ILogicStep } from 'api/types';
import { useFormErrorInjector } from 'modules/RiverValidation';
import { useCallback } from 'react';
import { SetFieldValue, useForm } from 'react-hook-form';
import { useDeepCompareEffect } from 'react-use';
import { getHashKey } from 'utils/api.sanitizer';
import { useStepActions } from './useStepActions';

/**
 * expose an api for updating a step.content prop with
 * react-hook-form api
 * the hook updates the river's store draft with any change in the form's component children
 */
export function useStepContentForm(step: ILogicStep) {
  const hash = getHashKey(step);
  const stepActions = useStepActions(hash);
  const useFormApi = useForm<ILogicStep>({
    /* ⚠️ WHY "defaultValues" is commented 🤨? 
      in e2e (files-export-big-query.feature-> Scenario: Show Connections Bar for snowflake block type),
      this causes an infinite cycling of the below useEffect
      in any case, a useEffect runs once the first time it is initiated,
      which sets the form anyways in this case
      */
    defaultValues: step,
    // we dont want to remove form fields when a nested ui form is removed from the dom.
    // the form's data "content" still includes the data the form was displaying and is still relevant
    shouldUnregister: false,
    // these are required for enforcing validation when fields have changed without invoking the form's "onSubmit"
    // mode: 'onBlur',
    // reValidateMode: 'onChange',
    // resolver: riverResolver,
  });

  const { handleSubmit } = useFormApi;
  // update the form's values when change comes from "content" props
  useFormUpdater(step, useFormApi.setValue);

  // update the river's content draft when change comes from the form's controls
  useContentUpdater(useFormApi, stepActions.updateContent);

  // update form errors when errors exist for hash
  useFormErrorInjector(hash, useFormApi.setError);

  const onSubmitHandler = useCallback(
    () => handleSubmit(stepActions.updateContent),
    [handleSubmit, stepActions.updateContent],
  );

  return {
    onSubmitHandler,
    useFormApi,
  };
}

/**
 * auto updates a step's content when change originates in form,
 * after 300ms - because it's like debounce 🧘
 */
const useContentUpdater = (useFormApi: any, updateContent) => {
  const stepChanges = useFormApi.getValues();
  const contentChanges = stepChanges?.content;

  const { hasContentUpdated, payload } = createPayloadByDirtyFields(
    useFormApi?.formState?.dirtyFields,
    contentChanges,
  );
  const shouldUpdateContent =
    !isRecordEmpty(contentChanges) && hasContentUpdated;

  useDeepCompareEffect(() => {
    if (shouldUpdateContent) {
      /* setting the default value for each key in "payload" - so it is
       * considered dirty on the next time it is changed
       */
      useFormApi.reset(stepChanges);
      updateContent(payload);
    }
  }, [shouldUpdateContent, payload]);
};

/**
 * creates a slimmer payload of properties (dirty fields) that were updated
 * in "content"
 */
const createPayloadByDirtyFields = (
  dirtyFields: Record<string, any>,
  content: Partial<Content>,
) => {
  const createFormChangesPayload = (payload, key) => ({
    ...payload,
    [key]: content[key],
  });
  const hasContentUpdated = Boolean(dirtyFields?.content);
  const payload = hasContentUpdated
    ? Object.keys(dirtyFields?.content).reduce(createFormChangesPayload, {})
    : {};
  return { hasContentUpdated, payload };
};

const isRecordEmpty = ({ hash, ...changes }: Record<string, any>) => {
  return Object.keys(changes)?.length === 0;
};

/**
 * listens to a logic step changes and set the value for each field.
 * WHY? `useForm.reset` caused an infinite loop
 */
const useFormUpdater = (step: ILogicStep, setValue: SetFieldValue<any>) => {
  useDeepCompareEffect(() => {
    setStepFormValue(step, setValue);
  }, [step]);
};

// content is a big object, so, it needs to be handled separatley
const excludedProps = ['content'];
const isAllowedProp = (entry: [string, any]) => {
  return !excludedProps.includes(entry[0]);
};

const setStepFormValue = (step: ILogicStep, setValue: SetFieldValue<any>) => {
  const setValueToKey =
    (prefix = '') =>
    ([key, value]: [string, any]) => {
      setValue(`${prefix}${key}`, value, {
        shouldValidate: false,
        shouldDirty: false,
      });
    };
  Object.entries(step).filter(isAllowedProp).forEach(setValueToKey());
  Object.entries(step.content).forEach(setValueToKey('content.'));
};
