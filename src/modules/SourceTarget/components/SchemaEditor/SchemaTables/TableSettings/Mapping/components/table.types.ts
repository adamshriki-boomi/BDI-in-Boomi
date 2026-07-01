import { IModifiedColumn } from 'modules/SourceTarget/store';
import { useEnhancedColumns } from './MatchKeyEditor/useEnhancedColumns';
import { useModifiedColumns } from '../hooks/useModifiedColumns';
import { IMappingItem } from '../types';

export interface TableItemProps {
  row: {
    original: IMappingItem;
  };
  column: {
    getProps: ReturnType<typeof useModifiedColumns> &
      ReturnType<typeof useEnhancedColumns>;
    onOpenEditor: (value: IModifiedColumn | IMappingItem) => any;
    openEditor: any;
  };
  value: any;
}
