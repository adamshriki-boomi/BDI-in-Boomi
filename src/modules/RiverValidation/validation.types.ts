export type ValidationErrorMessage = {
  message: string;
  path: string;
};
export type ValidationErrorMessages = Record<string, ValidationErrorMessage>;
export type ValidationError = {
  values: Record<string, any>;
  errors: ValidationErrorMessages;
  valid: boolean;
};

export const CUSTOM_ERROR_KEYWORD = 'errorMessage';
