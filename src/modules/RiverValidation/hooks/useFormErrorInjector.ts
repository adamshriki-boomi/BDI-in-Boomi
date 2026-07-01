import { useEffect } from 'react';
import { useRiver } from 'store/river';
import { ValidationErrorMessage } from '../validation.types';

/**
 * set error/s to a useForm instance
 */
export function useFormErrorInjector(
  hash: string,
  setError: (name: string, error: ValidationErrorMessage) => any,
) {
  const { errors } = useRiver();
  const nodeErrors = errors?.[hash];
  useEffect(() => {
    if (nodeErrors) {
      Object.entries(nodeErrors).forEach(([name, error]) => {
        setError(name, error);
      });
    }
  }, [nodeErrors, hash, setError]);
}
