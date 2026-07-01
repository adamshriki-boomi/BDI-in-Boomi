import { useEffect } from 'react';

export function useFocusFirstField(formApi, fieldName) {
  const { setFocus } = formApi;
  useEffect(() => {
    setFocus(fieldName);
  }, [fieldName, setFocus]);
}
