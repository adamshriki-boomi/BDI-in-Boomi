import { IModifiedColumn } from 'modules/SourceTarget/store';

export const createModifiedColumn = (
  props?: Partial<IModifiedColumn>,
): IModifiedColumn => ({
  name: '',
  ...props,
  is_selected: props?.is_selected ?? true,
});

export { detectColumnConflicts } from './utils/columnConflicts';
export type { ConflictDetectionResult } from './utils/columnConflicts';
