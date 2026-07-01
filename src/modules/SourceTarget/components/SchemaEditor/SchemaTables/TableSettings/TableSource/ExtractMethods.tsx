import { ExtractMethod } from 'api/types';
import { ExtractMethod as MethodType } from 'modules/SourceTarget/store';

export const extractionMethods: { label: string; value: MethodType }[] = [
  { label: 'Incremental', value: ExtractMethod.INCREMENTAL },
  { label: 'All', value: ExtractMethod.ALL },
];
