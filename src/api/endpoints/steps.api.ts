import { LogicStep } from 'store/rivers/types/river.types';
import { postBody, putData } from '../api.proxy';

export const getStepMapping = ({
  logic_step,
  variables,
}: {
  logic_step: LogicStep;
  variables: Record<string, string>;
}) =>
  putData(`/mapping`, { logic_step_auto_mapping: true, logic_step, variables });

export const pollStepMapping = params => postBody('/mapping', params);
