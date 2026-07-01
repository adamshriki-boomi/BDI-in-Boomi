import { useTargetByBlockType } from 'modules/Datasources/useLogicTargets';

export const useTitles = (blockType: string) => {
  const target = useTargetByBlockType(blockType);
  return {
    connectionHeader: target?.name,
    target,
  };
};
