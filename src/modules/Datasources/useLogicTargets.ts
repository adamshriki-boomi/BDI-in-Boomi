import { StepTypes, TargetTypes } from 'api/types';
import { useGetTargetTypesQuery } from 'modules/Datasources/store/targets.query';
import { useMemo } from 'react';
import { compare } from 'utils/array.utils';

export const useLogicTargets = () => {
  const { data } = useGetTargetTypesQuery();
  return data?.filter(({ logic_step_type }) => Boolean(logic_step_type));
};

export const useStepTypeByTargetType = (target: TargetTypes) => {
  const { data } = useGetTargetTypesQuery();
  return useMemo(
    () => data?.find(compare('target_type', target))?.logic_step_type,
    [target, data],
  );
};
export const useTargetByBlockType = (blockType: StepTypes | string) => {
  const { data } = useGetTargetTypesQuery();
  return useMemo(
    () => data?.find(compare('logic_step_type', blockType)),
    [blockType, data],
  );
};
export const useGetTarget = (target: TargetTypes | string) => {
  const { data } = useGetTargetTypesQuery();
  return useMemo(
    () => target && data?.find(ds => ds?.api_name === target),
    [data, target],
  );
};

/**
 * resolves the data target from targets according to step.block_type
 */
const isLogicStepType = compare('logic_step_type', true, Boolean);

export const useTargetTypesFilter = (filterFunc: any = isLogicStepType) => {
  const { data } = useGetTargetTypesQuery();
  return useMemo(() => data?.filter(filterFunc), [data, filterFunc]);
};
