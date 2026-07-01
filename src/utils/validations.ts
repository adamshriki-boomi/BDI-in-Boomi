export const passwordNote =
  'Password should contain at least 6 characters, containing english letters, numbers and special characters\n';

export const passwordRegex = new RegExp(
  '^(?=.{6,})(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?])(?=.*?[0-9]).*$',
);

export const alphaNumericValidation = new RegExp(
  '^[a-z](?:_?[a-z0-9]+)*$',
  'i',
);

export const envNameValidation = new RegExp('^[a-zA-Z0-9_ -]+$', 'i');

export const emailValidation = new RegExp(
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/,
  'i',
);
export const validateEmail = (email: string) => {
  return email && emailValidation.test(email);
};

export const multiEmailsValidation = new RegExp(
  /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4},?)+$/,
  'i',
);

/**
 * Reserved variable names that cannot be used
 */
export const RESERVED_VARIABLE_NAMES = [
  'run_id',
  'env_id',
  'account_id',
] as const;

/**
 * Validates if a variable name is reserved
 * @param variableName - The variable name to validate
 * @returns Error message string if reserved, null otherwise
 */
export const validateReservedVariableName = (
  variableName: string,
): string | null => {
  if (!variableName) {
    return null;
  }
  const normalizedName = variableName.trim().toLowerCase();
  const isReserved = RESERVED_VARIABLE_NAMES.some(
    reserved => reserved.toLowerCase() === normalizedName,
  );
  return isReserved ? `${variableName} is a reserved name` : null;
};
