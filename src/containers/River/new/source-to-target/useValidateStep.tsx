import { getQueryParams } from 'hooks/router';
import { RiverForm } from './form.hooks';
import { TargetTypesV1 } from 'api/types';

const isTargetValid = (formData: RiverForm): boolean => {
  const targetName = formData?.river?.properties?.target?.name;
  // Decide if the target is valid based on the target name, add new targets validations on demand
  switch (targetName) {
    case TargetTypesV1.EMAIL: {
      const emailList = (formData?.river?.properties?.target as any)
        ?.email_list;
      return Boolean(emailList && emailList.trim().length > 0);
    }
    default: {
      return Boolean(formData?.river?.properties?.target?.connection_id);
    }
  }
};

export const useValidateStep = (step: number, form) => {
  const { chat_id } = getQueryParams(['chat_id']);

  const formData = form?.watch();
  const formValid = form?.formState?.isValid;
  return stepValidators?.[step](formData, formValid, chat_id);
};

export const useHeaderStepValidator = (currentStep, form) => {
  const formData = form?.watch();
  const formValid = form?.formState?.isValid;
  const isBlueprint = ['blueprint', 'blueprint_copilot'].includes(
    formData?.river?.properties?.source?.name,
  );
  const { chat_id } = getQueryParams(['chat_id']);
  const isCopilot = chat_id;

  switch (currentStep) {
    case 0: {
      return {
        0: true,
        1: isCopilot
          ? true
          : isBlueprint
          ? Boolean(
              formData?.river?.properties?.source?.additional_settings
                ?.recipe_id,
            )
          : Boolean(formData?.river?.properties?.source?.connection_id),
        2: isTargetValid(formData) && formValid,
        3: isTargetValid(formData) && formValid,
      };
    }
    case 1: {
      return {
        0: true,
        1: true,
        2: isTargetValid(formData),
        3: isTargetValid(formData) && formValid,
      };
    }
    case 2: {
      return {
        0: true,
        1: true,
        2: true,
        3: true,
      };
    }
    case 3: {
      return {
        0: true,
        1: true,
        2: true,
        3: true,
      };
    }
    default:
      return null;
  }
};

const stepValidators = {
  '0': (formData: RiverForm, _, chat_id) =>
    chat_id
      ? true
      : Boolean(formData.river?.properties?.source?.connection_id) ||
        Boolean(
          formData.river?.properties?.source?.additional_settings?.recipe_id,
        ),
  '1': (formData: RiverForm, formValid) => isTargetValid(formData) && formValid,
  '2': (formData: RiverForm) => isTargetValid(formData),
  '3': (formData: RiverForm) => isTargetValid(formData),
};
