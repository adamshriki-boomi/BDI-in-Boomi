import { ErrorObject } from 'ajv';
import { ILogicStep } from 'api/types';
import { ValidationErrorMessages } from 'modules';
import {
  validateRiverContent,
  validateRiverV2Content,
} from './river.validator';
import { CUSTOM_ERROR_KEYWORD, ValidationError } from './validation.types';

const copy = data => JSON.parse(JSON.stringify(data));
export function validateLogicRiver(data, isApiV2) {
  const validate = isApiV2 ? validateRiverV2Content : validateRiverContent;
  const valid = validate(data);
  return { valid, errors: copy(validate.errors) };
}

export function riverErrorResolver(
  values: ILogicStep,
  isApiV2: boolean,
): ValidationError {
  if (!values || (!isApiV2 && !values.isEnabled)) {
    return { values, errors: null, valid: null };
  }

  const { valid, errors: errorResults } = validateLogicRiver(values, isApiV2);
  const errors = errorResults
    ?.filter(isValidKeyword)
    ?.map(normalizeError)
    ?.map(parseError)
    .reduce(appendError, {});

  return {
    values,
    errors,
    valid: valid || Object.keys(errors).length === 0,
  };
}
// UTILS
const appendError = (result: ValidationErrorMessages, error: ErrorObject) => ({
  ...result,
  ...error,
});
const normalizeError = (error: ErrorObject) => {
  return isCustomErrorMessage(error)
    ? {
        ...error?.params?.errors?.[0],
        message: error.message,
      }
    : error;
};
const xpathToJsonPath = (path: string) => path?.substr(1)?.replaceAll('/', '.');
const parseError = (error: ErrorObject) => {
  const message = error.message;
  const instancePath = error?.instancePath;
  const path = Boolean(instancePath)
    ? xpathToJsonPath(instancePath)
    : error?.params?.missingProperty;

  return createValidationErrorMessage(error?.params, path, message);
};
const createValidationErrorMessage = (
  params: Record<string, any>,
  path: string,
  message: string,
) => {
  const missingProp = params?.missingProperty;
  const errorPath = path && !missingProp ? path : `${path}.${missingProp}`;
  return {
    [errorPath]: { message, path: errorPath },
  };
};

const isValidKeyword = (error: Record<string, any>) => {
  return ['if', 'else', 'then', 'anyOf', 'allOf'].every(
    keyword => keyword !== error?.keyword,
  );
};

const isCustomErrorMessage = error => {
  return error?.keyword === CUSTOM_ERROR_KEYWORD;
};
