import { useRiver } from 'store/river';

/**
 * validates a JSON PATH of a river STEP and return its message
 * i.e - "content.sql_editor"
 */
export function useStepPropValidationMessage(hash, path) {
  const { errors } = useRiver();
  return errors?.[hash]?.[path]?.message;
}
