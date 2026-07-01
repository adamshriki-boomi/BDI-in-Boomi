import React from 'react';

/**
 * manage input value state and peforms a pattern validation (allow html pattern and required validation)
 * - useful for using input without register | useFormApi(control)
 * - the validation is invoked programtically because we want to have a custom error display and not the browsers'
 */
export const useInputDraftHandler = (
  value: string | number,
  { enableHandler, pattern, required, onChange },
) => {
  const [hasError, setError] = React.useState(false);
  const [valueDraft, setValueDraft] = React.useState(value || '');

  const draftProps = React.useMemo(() => {
    return enableHandler
      ? {
          value: valueDraft,
          pattern,
          required,
          onChange: event => {
            const value = event.target.value;
            if (value.match(pattern)) {
              setError(false);
              onChange && onChange(event);
            } else {
              setError(true);
            }
            setValueDraft(value);
          },
        }
      : {};
  }, [enableHandler, onChange, pattern, required, valueDraft]);
  return { draftProps, valueDraft, hasError };
};
